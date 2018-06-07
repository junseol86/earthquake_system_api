mysql = require 'mysql'
secret = require './secret'
winston = require './winston'

pool = mysql.createPool secret.connectionInfo

db = {
  query: (res, queryString, placeholders, func) ->
    pool.query(queryString, placeholders, (error, results, fields) ->
      if error
        winston.errorLog 'SQL ERROR', error
        res.status(500).send 'SQL ERROR:' + error
        return
      winston.queryLog queryString
      func(results, fields)
    )

}

module.exports = db