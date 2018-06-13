db = require '../tool/mysql'
member = require './member_d'

dbwork = {

  # 코드 받기
  getCode: (req, res) ->
    db.query res, 'SELECT cd_code FROM eq_code WHERE cd_name = ?', [req.headers.code], (results, fields) ->
      res.send results[0]

  # 코드 변경
  modify: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      db.query res, 'UPDATE eq_code SET cd_code = ? WHERE cd_name = ?', [req.body.code, req.body.name], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result
}

module.exports = dbwork