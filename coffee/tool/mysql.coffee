mysql = require 'mysql'
connection = mysql.createConnection {
  host: '35.229.252.63'
  user: 'kyeongju_doro'
  password: 'KimChang0!'
  database: 'eq_system'
}

db = {
  query: (queryString, placeholders, func) ->
    connection.query(queryString, placeholders, (error, results, fields) ->
      if error
        console.error('error connecting' + error.stack)
        return
      func(results, fields)
    )

}

module.exports = db