db = require '../tool/mysql'
member = require './member_d'
util = require './../tool/util'
fcm = require './../tool/fcm'

dbwork = {

  # 지진 리스트 다운
  getList: (req, res) ->
    db.query res, 'SELECT * FROM eq_earthquake ORDER BY eq_idx DESC', [], (results, fields) ->
      results.map (eq) ->
        util.evalEq eq
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

  #지진 진행/종료
  activeToggle: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      allOffQr = 'UPDATE eq_earthquake SET eq_active = 0'
      db.query res, allOffQr, [], (results, fields) ->
        result.success = results.affectedRows > 0
        if req.body.set == '0'
          res.send result
        else 
          actvQr = 'UPDATE eq_earthquake SET eq_active = 1 WHERE eq_idx = ?'
          db.query res, actvQr, [req.body.eq_idx], (results, fields) ->
            result.success = results.affectedRows > 0
            res.send result

  #지진 알림 보내기
  sendEqNotification: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      level = if req.body.level == 0 then '자체대응' else if req.body.level == 1 then '대응 1단계' else '대응 2단계'
      type = if req.body.type == 'inland' then '내륙' else '해역'
      ntfStr = "SELECT * FROM eq_member"
      db.query res, ntfStr, [], (results, fields) ->
        results.map (mbr) ->
          if mbr.mbr_fcm.length > 0
            fcm.sendFCM mbr.mbr_fcm, 'earthquake', "지진발생 [#{level}]", "#{type} #{req.body.strength}"
        res.send result
      

}
    
module.exports = dbwork