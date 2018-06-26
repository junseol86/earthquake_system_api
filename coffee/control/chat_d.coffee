db = require '../tool/mysql'
member = require './member_d'
util = require './../tool/util'

dbwork = {

  getHqBefore: (req, res) ->
    chtIdx = req.params.chtIdx
    firstQuery = 'SELECT * FROM eq_chat ORDER BY cht_idx DESC'
    firstParam = []
    laterQuery = 'SELECT * FROM eq_chat WHERE cht_idx < ? ORDER BY cht_idx DESC LIMIT 30'
    laterParam = [chtIdx]
    qr = if chtIdx == '0' then firstQuery else laterQuery
    prm = if  chtIdx == '0' then firstParam else laterParam
    db.query res, qr, prm, (results, fields) ->
      res.send results

  insertHq: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_chat
        (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text)
        VALUES
        (?, ?, ?, ?, ?, ?)'
      insPrm = [0, '상황실', req.body.cht_to, req.body.cht_to_team, req.body.cht_to_name, req.body.cht_text]
      db.query res, insQr, insPrm, (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  getHqAfter: (req, res) ->
    chtIdx = req.params.chtIdx
    qr = 'SELECT * FROM eq_chat WHERE cht_idx > ? ORDER BY cht_idx DESC'
    prm = [chtIdx]
    db.query res, qr, prm, (results, fields) ->
      res.send results

}

module.exports = dbwork