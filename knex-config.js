const {
  filter, forEach, intersection, isObject, keys, map, zipObject,
} = require('lodash/fp');

const createKey = (obj, key, idx, keyNames) =>
  (obj[key] = Number.isNaN(Number.parseInt(keyNames[idx + 1], 10)) ? {} : []);

const hasAProperty = (props, obj) => intersection(props, keys(obj)).length > 0;

const arrayToObject = (props, [head, ...values]) =>
  (values.length === 0
  && isObject(head)
  && (hasAProperty(props, head) || keys(head).length === 0)
    ? head
    : zipObject(props, [head, ...values]));

const navigatePath = (obj, key, idx, keyNames) => {
  if (obj === undefined) return obj;
  if (!Object.prototype.hasOwnProperty.call(obj, key)) createKey(obj, key, idx, keyNames);
  return obj[key];
};

const parseConnectionString = connectionString =>
  map(
    (x) => {
      const e = x.indexOf('=');
      const k = e > -1 ? x.substring(0, e) : x;
      const v = e > -1 ? x.substring(e + 1, x.length) : undefined;
      return [k, v];
    },
    filter(x => x !== '', connectionString.split(';'))
  );

const setProperty = (obj, propertyPath, value) => {
  let lastProperty;
  propertyPath.split('.').forEach((property, idx, properties) => {
    idx < properties.length - 1
      ? (obj = navigatePath(obj, property, idx, properties))
      : (lastProperty = property);
  });
  obj ? (obj[lastProperty] = value) : undefined;
};
  
const setProperties = (obj, keyValueArrays) => {
  forEach(([key, value]) => setProperty(obj, key, value), keyValueArrays);
  return obj;
};

module.exports = (...args) => {
  const {
    connectionString, client = 'mssql', appName, debug = false,
  } = arrayToObject(['connectionString', 'client', 'appName', 'debug'], args);

  return parseConnectionString(connectionString).reduce(
    (p, [k, v]) => {
      const kvs = [];

      if (/^((Data Source)|Server)$/i.test(k)) {
        const [serverAndPort, instanceName] = v.split('\\');
        // eslint-disable-next-line no-unused-expressions
        instanceName
          ? kvs.push(['connection.options.instanceName', instanceName])
          : undefined;
        const [host, port] = serverAndPort.split(',');
        kvs.push(['connection.host', host.replace(/^tcp:/i, '')]);
        // eslint-disable-next-line no-unused-expressions
        port ? kvs.push(['connection.port', Number(port)]) : undefined;
      }

      /* eslint-disable no-nested-ternary */
      // eslint-disable-next-line no-unused-expressions
      /^User ID$/i.test(k)
        ? kvs.push(['connection.user', v])
        : /^Password$/i.test(k)
          ? kvs.push(['connection.password', v])
          : /^(Database|(Initial Catalog))$/i.test(k)
            ? kvs.push(['connection.database', v])
            : /^Application Name$/i.test(k) && !appName
              ? kvs.push(['connection.options.appName', v])
              : /^Encrypt$/i.test(k)
                ? kvs.push(['connection.options.encrypt', /^(True|Yes)$/i.test(v)])
                : /^Debug$/i.test(k)
                  ? kvs.push(['debug', /^(True|Yes)$/i.test(v)])
                  : /^Client$/i.test(k)
                    ? kvs.push(['client', v])
                    : undefined;
      /* eslint-enable no-nested-ternary */
      return setProperties(p, kvs);
    },
    { debug, client, connection: { options: { appName } } }
  );
};
