db = require '../tool/mysql'
member = require './member_d'

dbwork = {

  # 코드 받기
  getList: (code, res) ->
    db.query res, 'SELECT * FROM eq_spot', [], (results, fields) ->
      res.send results

}
module.exports = dbwork