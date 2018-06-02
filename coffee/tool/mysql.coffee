mysql = require 'mysql'
secret = require './secret'
winston = require './winston'

connection = mysql.createConnection secret.connectionInfo

db = {
  query: (res, queryString, placeholders, func) ->
    connection.query(queryString, placeholders, (error, results, fields) ->
      if error
        winston.errorLog 'SQL ERROR', error.stack
        res.status(500).send 'SQL ERROR'
        return
      winston.queryLog queryString
      func(results, fields)
    )

}

module.exports = db