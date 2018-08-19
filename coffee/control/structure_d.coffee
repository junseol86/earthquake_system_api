db = require '../tool/mysql'
member = require './member_d'
earthquake = require './earthquake_d'
util = require './../tool/util'
fcm = require './../tool/fcm'

dbwork = {

  # 구조물 리스트 다운
  getList: (req, res) ->
    db.query res, 'SELECT * FROM eq_structure ORDER BY str_rpt_prior DESC, str_name ASC', [], (results, fields) ->
      structures = results
      db.query res, 'SELECT * FROM eq_earthquake where eq_active = 1', [], (eqs, fields) ->
        # 지진이 없는 상황
        if eqs.length == 0
          structures.map (structure) ->
            structure.on_team = 0
          res.send structures
        # 지진 발생시
        else
          eq = eqs[0]
          util.evalEq eq
          res.send util.assignStr eq, structures

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
        (str_branch, str_line, str_name, str_order, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?)'
      db.query res, insQr, [req.body.branch, req.body.line, req.body.name, req.body.order, req.body.lat, req.body.lng], (results, fields) ->
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
        str_branch = ?, str_line = ?, str_name = ?, str_order = ?, 
        str_rpt_prior = ?, str_spec = ?, str_need_check = ?,
        latitude = ?, longitude = ?
        WHERE str_idx = ?'
      db.query res, modQr, [
        req.body.str_branch, req.body.str_line, req.body.str_name, req.body.str_order, 
        req.body.str_rpt_prior, req.body.str_spec, req.body.str_need_check,
        req.body.latitude, req.body.longitude, req.body.str_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        if !result.success
          res.send result
        else
          _this.getOneByIdx req, res, req.body.str_idx, (structure) ->
            result.structure = structure
            res.send result

  # 구조물 보고
  report: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      rptQr = 'UPDATE eq_structure SET str_report = ?, str_last_reported = NOW() WHERE str_idx = ?'
      db.query res, rptQr, [req.body.str_report, req.body.str_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  #구조물 보고 요청 알람
  requestReport: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      ntfStr = "SELECT * FROM eq_member"
      db.query res, ntfStr, [], (results, fields) ->
        results.map (mbr) ->
          if mbr.mbr_fcm.length > 0
            fcm.sendFCM mbr.mbr_fcm, 'structure', '구조물 점검, 보고할 것', req.body.str_name
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