# elastic-apm-test
tests the Elastic APM service

# usage
node . dbConnectionString query

where:

    dbConnectionString is like "Server=mySqlServer;Database=myDb;User ID=me;Password=myPwd;

    and query is like "select top(:random100) * from myTable"

# note

    you should probably set the ELASTIC_APM_SERVER_URL and ELASTIC_APM_SECRET_TOKEN env variables