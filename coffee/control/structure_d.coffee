db = require '../tool/mysql'
member = require './member_d'

dbwork = {

  # 구조물 리스트 다운
  getList: (req, res) ->
    db.query res, 'SELECT * FROM eq_structure ORDER BY str_name ASC', [], (results, fields) ->
      res.send results

  # 구조물 하나 다운
  getOneByIdx: (req, res, str_idx, func) ->
    db.query res, 'SELECT * FROM eq_structure WHERE str_idx = ?', [str_idx], (results, fields) ->
      func results[0]

  # 구조물 입력
  insert: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_structure
        (str_branch, str_line, str_name, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)'
      db.query res, insQr, [req.body.branch, req.body.line, req.body.name, req.body.lat, req.body.lng], (results, fields) ->
        result.success = results.affectedRows > 0
        if !result.success
          res.send result
        else
          _this.getOneByIdx req, res, results.insertId, (structure) ->
            result.structure = structure
            res.send result

  # 구조물 수정
  modify: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      modQr = 'UPDATE eq_structure SET
        str_branch = ?, str_line = ?, str_name = ?, latitude = ?, longitude = ?
        WHERE str_idx = ?'
      db.query res, modQr, [req.body.str_branch, req.body.str_line, req.body.str_name, req.body.latitude, req.body.longitude, req.body.str_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        if !result.success
          res.send result
        else
          _this.getOneByIdx req, res, req.body.str_idx, (structure) ->
            result.structure = structure
            res.send result

  # 구조물 삭제 
  delete: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      delQr = 'DELETE FROM eq_structure WHERE str_idx = ?'
      db.query res, delQr, [req.body.str_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

}
    
module.exports = dbwork