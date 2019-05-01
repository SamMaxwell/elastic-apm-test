# elastic-apm-test
tests the Elastic APM service

# usage
node . dbConnectionString query count

where:

    dbConnectionString is like "Server=mySqlServer;Database=myDb;User ID=me;Password=myPwd;

    query is like "select top(:random100) * from myTable where someDate < :now" and supports substutions
      :random100 generates a random number between 1 and 100
      :now is the current date/time

    and count is a number that is the number of times to run the query

# note

    you should probably set the env variables:
      ELASTIC_APM_SERVER_URL
      ELASTIC_APM_SECRET_TOKEN
      and ELASTIC_APM_LOG_LEVEL

    if you set NO_APM you will disable APM