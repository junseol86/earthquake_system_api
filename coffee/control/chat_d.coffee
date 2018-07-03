db = require '../tool/mysql'
member = require './member_d'
util = require './../tool/util'

dbwork = {

  lastChtIdx: 0

  getHqBefore: (req, res) ->
    _this = this
    chtIdx = Number(req.params.chtIdx)
    firstQuery = 'SELECT * FROM eq_chat ORDER BY cht_idx DESC LIMIT 30'
    firstParam = []
    laterQuery = 'SELECT * FROM eq_chat WHERE cht_idx < ? ORDER BY cht_idx DESC LIMIT 30'
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
      qr = 'SELECT * FROM eq_chat WHERE cht_idx > ? ORDER BY cht_idx DESC'
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
        # db.query res, 'SELECT MAX(cht_idx) max_cht_idx FROM eq_chat', [], ()
        res.send result


  getMbrBefore: (req, res) ->
    _this = this
    chtIdx = Number(req.params.chtIdx)
    rh = req.headers
    firstQuery = 'SELECT * FROM eq_chat
      WHERE (
      cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ?
      ) ORDER BY cht_idx DESC LIMIT 30'
    firstParam = [rh.cht_to_team, rh.mbr_idx, rh.mbr_idx]
    laterQuery = 'SELECT * FROM eq_chat 
      WHERE cht_idx < ? 
      AND (
      cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ?
      )
      ORDER BY cht_idx DESC LIMIT 30'
    laterParam = [chtIdx, rh.cht_to_team, rh.mbr_idx, rh.mbr_idx]
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
        cht_to = 0 OR cht_to_team = ? OR cht_to = ?
        ) ORDER BY cht_idx DESC'
      prm = [chtIdx, rh.cht_to_team, rh.cht_to]
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
      insPrm = [rb.cht_from_idx, rb.cht_from_name, 0, -1, '', rb.cht_text]
      db.query res, insQr, insPrm, (results, fields) ->
        result.success = results.affectedRows > 0
        if result.success
          _this.lastChtIdx = results.insertId
        res.send result

}

module.exports = dbwork