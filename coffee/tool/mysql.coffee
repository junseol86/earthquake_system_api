mysql = require 'mysql'
secret = require './secret'

connection = mysql.createConnection secret.connectionInfo

db = {
  query: (queryString, placeholders, func) ->
    connection.query(queryString, placeholders, (error, results, fields) ->
      if error
        console.error('error connecting' + error.stack)
        res.status(500).send 'SQL ERROR'
      func(results, fields)
    )

}

module.exports = db