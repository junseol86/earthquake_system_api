db = require '../tool/mysql'
member = require './member_code_d'

dbwork = {

  # 코드 받기
  getCode: (code, res, func) ->
    db.query res, 'SELECT cd_code FROM eq_code WHERE cd_name = ?', [code], (results, fields) ->
      func(results[0])

  getRegisterCode: (req, res) ->
    _this = this
    _this.getCode 'register', res, (result) ->
      res.send result
  

  # 코드 변경
  modify: (req, res) ->
    _this = this
    console.log member
    console.log member.tokenCheck
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      db.query res, 'UPDATE eq_code SET cd_code = ? WHERE cd_name = ?', [req.body.code, req.body.name], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result
}

module.exports = dbwork