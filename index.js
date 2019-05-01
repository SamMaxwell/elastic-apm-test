const apmClient = !process.env.NO_APM ? require('elastic-apm-node').start() : undefined;

const knex = require('knex');
const knexConfig = require('./knex-config');

const transaction = async (apm, name, cb) => {
  const trx = apm ? apm.startTransaction(name) : undefined;
  let results;
  let err;
  try {
    results = await cb();
  } catch(exception) {
    err = exception;
  }
  if (trx) trx.end();
  if (err) throw err;
  return results;
}

const proc = async ({ apm, dbConnectionString, query, count }) => {
  const config = knexConfig(dbConnectionString);
  const db = knex(config);

  for (let i = 0; i < count; i += 1) {
    await transaction(
      apm,
      'test',
      () => db.raw(query, { now: new Date(), random100: Math.floor(Math.random() * 100) + 1 })
    );
  }

  process.exit(0);
}

const [_, __, dbConnectionString, query, countString] = process.argv

let count;

const error =
  !dbConnectionString ? 'dbConnectionString (cli argument) is required'
  : !query ? 'query (cli argument) is required'
  : Number.isNaN(count = Number.parseInt(countString || '1', 10)) ? 'count (cli argument) must be a Number'
  : undefined;

if (error) {
  console.error(error);
  console.warn('usage: node . dbConnectionString query count');
  console.warn('  dbConnectionString (String)   db connection string');
  console.warn('  query (String)                query to run (supports :now and :random100 substitutions)');
  console.warn('  count (Number)                count of times the query should run (default 1)');
  process.exit(1);
}

proc({ apm: apmClient, dbConnectionString, query, count });
