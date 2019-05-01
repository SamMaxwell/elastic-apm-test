const apm = require('elastic-apm-node').start({ logLevel: 'trace' });

const knex = require('knex');
const knexConfig = require('./knex-config');

const proc = async ({ dbConnectionString, query }) => {
  const config = knexConfig(dbConnectionString);
  const db = knex(config);
  await db.raw(query, { now: new Date(), random100: Math.floor(Math.random() * 100) });
  process.exit(0);
}

const [_, __, dbConnectionString, query] = process.argv

const error =
  !dbConnectionString ? 'dbConnectionString (cli argument) is required'
  : !query ? 'query (cli argument) is required'
  : undefined;

if (error) {
  console.error(error);
  console.warn('usage: node . dbConnectionString query');
  console.warn('  dbConnectionString (string)   db connection string');
  console.warn('  query (string)                query to run (supports :now and :random100 substitutions)');
  process.exit(1);
}

proc({ dbConnectionString, query });
