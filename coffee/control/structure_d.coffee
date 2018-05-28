db = require '../tool/mysql'

dbwork = {

  # 구조물 리스트 다운
  getList: (req, res) ->
    db.query 'SELECT * FROM eq_structure', [], (results, fields) ->
      res.send results

}

module.exports = dbwork