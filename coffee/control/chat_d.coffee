db = require '../tool/mysql'
member = require './member_d'
util = require './../tool/util'
fcm = require './../tool/fcm'

dbwork = {

  lastChtIdx: 0

  getHqBefore: (req, res) ->
    _this = this
    chtIdx = Number(req.params.chtIdx)
    firstQuery = 'SELECT * FROM eq_chat
      WHERE cht_from_idx = 0 OR cht_to != -1 
      ORDER BY cht_idx DESC LIMIT 30'
    firstParam = []
    laterQuery = 'SELECT * FROM eq_chat 
      WHERE (cht_from_idx = 0 OR cht_to != -1)
      AND cht_idx < ? 
      ORDER BY cht_idx DESC LIMIT 30'
    laterParam = [chtIdx]
    qr = if chtIdx == 0 then firstQuery else laterQuery
    prm = if  chtIdx == 0 then firstParam else laterParam
    db.query res, qr, prm, (results, fields) ->
      if chtIdx == 0 && results.length > 0
        _this.lastChtIdx = Math.max(_this.lastChtIdx, results[0].cht_idx)
      res.send results

  getHqAfter: (req, res) ->
    chtIdx = Number(req.params.chtIdx)
    if this.lastChtIdx <= chtIdx
      res.send []
    else
      qr = 'SELECT * FROM eq_chat 
        WHERE (cht_from_idx = 0 OR cht_to != -1) 
        AND cht_idx > ? 
        ORDER BY cht_idx DESC'
      prm = [chtIdx]
      db.query res, qr, prm, (results, fields) ->
        res.send results

  insertHq: (req, res) ->
    _this = this
    rb = req.body
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_chat
        (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text)
        VALUES
        (?, ?, ?, ?, ?, ?)'
      insPrm = [0, '상황실', rb.cht_to, rb.cht_to_team, rb.cht_to_name, rb.cht_text]
      db.query res, insQr, insPrm, (results, fields) ->
        result.success = results.affectedRows > 0
        if result.success
          _this.lastChtIdx = results.insertId
          _this.sendChatFcm req, res, '상황실', result 
        else
          res.send result

  getMbrBefore: (req, res) ->
    _this = this
    chtIdx = Number(req.params.chtIdx)
    rh = req.headers
    firstQuery = 'SELECT * FROM eq_chat
      WHERE (
      cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ?
      ) ORDER BY cht_idx DESC LIMIT 30'
    firstParam = [rh.mbr_team, rh.mbr_idx, rh.mbr_idx]
    laterQuery = 'SELECT * FROM eq_chat 
      WHERE cht_idx < ? 
      AND (
      cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ?
      )
      ORDER BY cht_idx DESC LIMIT 30'
    laterParam = [chtIdx, rh.mbr_team, rh.mbr_idx, rh.mbr_idx]
    qr = if chtIdx == 0 then firstQuery else laterQuery
    prm = if  chtIdx == 0 then firstParam else laterParam
    db.query res, qr, prm, (results, fields) ->
      if chtIdx == 0 && results.length > 0
        _this.lastChtIdx = Math.max(_this.lastChtIdx, results[0].cht_idx)
      res.send results

  getMbrAfter: (req, res) ->
    chtIdx = Number(req.params.chtIdx)
    if this.lastChtIdx <= chtIdx
      res.send []
    else
      rh = req.headers
      qr = 'SELECT * FROM eq_chat
        WHERE cht_idx > ? 
        AND (
        cht_to = 0 OR cht_from_idx = ? OR cht_to_team = ? OR cht_to = ?
        ) ORDER BY cht_idx DESC'
      prm = [chtIdx, rh.mbr_idx, rh.mbr_team, rh.mbr_idx]
      db.query res, qr, prm, (results, fields) ->
        res.send results

  insertMbr: (req, res) ->
    _this = this
    rb = req.body
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_chat
        (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text)
        VALUES
        (?, ?, ?, ?, ?, ?)'
      insPrm = [rb.cht_from_idx, rb.cht_from_name, rb.cht_to, rb.cht_to_team, '', rb.cht_text]
      db.query res, insQr, insPrm, (results, fields) ->
        result.success = results.affectedRows > 0
        if result.success
          _this.lastChtIdx = results.insertId
          _this.sendChatFcm req, res, rb.cht_from_name, result 
        else
          res.send result

  sendChatFcm: (req, res, chtFrom, finalResult) ->
    _this = this
    rb = req.body
    tknQry = ''
    tknPrm = []
    if rb.cht_to == '0'
      tknQry = 'SELECT mbr_fcm FROM eq_member'
      tknPrm = []
    else if rb.cht_to == '-1'
      tknQry = 'SELECT mbr_fcm FROM eq_member WHERE mbr_team = ?'
      tknPrm = [rb.cht_to_team]
    else
      tknQry = 'SELECT mbr_fcm FROM eq_member WHERE mbr_idx = ?'
      tknPrm = [rb.cht_to]
    db.query res, tknQry, tknPrm, (results, fields) ->
      results.map (mbr) ->
        if mbr.mbr_fcm.length > 0
          fcm.sendFCM mbr.mbr_fcm, 'chat', chtFrom, rb.cht_text
      res.send finalResult
}

module.exports = dbwork