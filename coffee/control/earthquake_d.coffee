db = require '../tool/mysql'
member = require './member_d'

dbwork = {

  # 지진 리스트 다운
  getList: (req, res) ->
    db.query res, 'SELECT * FROM eq_earthquake', [], (results, fields) ->
      res.send results

  # 지진 하나 다운
  getOneByIdx: (req, res, eq_idx, func) ->
    db.query res, 'SELECT * FROM eq_earthquake WHERE eq_idx = ?', [eq_idx], (results, fields) ->
      func results[0]

  # 지진 입력
  insert: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_earthquake
        (eq_type, eq_strength, latitude, longitude)
        VALUES (?, ?, ?, ?)'
      db.query res, insQr, [req.body.type, req.body.strength, req.body.lat, req.body.lng], (results, fields) ->
        result.success = results.affectedRows > 0
        if !result.success
          res.send result
        else
          _this.getOneByIdx req, res, results.insertId, (earthquake) ->
            result.eq_earthquake = earthquake
            res.send result

  # 지진 삭제 
  delete: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      delQr = 'DELETE FROM eq_earthquake WHERE eq_idx = ?'
      db.query res, delQr, [req.body.eq_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

}
    
module.exports = dbwork