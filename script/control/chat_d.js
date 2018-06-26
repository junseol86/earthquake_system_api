var db, dbwork, member, util;

db = require('../tool/mysql');

member = require('./member_d');

util = require('./../tool/util');

dbwork = {
  getHqBefore: function(req, res) {
    var chtIdx, firstParam, firstQuery, laterParam, laterQuery, prm, qr;
    chtIdx = req.params.chtIdx;
    firstQuery = 'SELECT * FROM eq_chat ORDER BY cht_idx DESC';
    firstParam = [];
    laterQuery = 'SELECT * FROM eq_chat WHERE cht_idx < ? ORDER BY cht_idx DESC LIMIT 30';
    laterParam = [chtIdx];
    qr = chtIdx === '0' ? firstQuery : laterQuery;
    prm = chtIdx === '0' ? firstParam : laterParam;
    return db.query(res, qr, prm, function(results, fields) {
      return res.send(results);
    });
  },
  insertHq: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insPrm, insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_chat (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text) VALUES (?, ?, ?, ?, ?, ?)';
      insPrm = [0, '상황실', req.body.cht_to, req.body.cht_to_team, req.body.cht_to_name, req.body.cht_text];
      return db.query(res, insQr, insPrm, function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  getHqAfter: function(req, res) {
    var chtIdx, prm, qr;
    chtIdx = req.params.chtIdx;
    qr = 'SELECT * FROM eq_chat WHERE cht_idx > ? ORDER BY cht_idx DESC';
    prm = [chtIdx];
    return db.query(res, qr, prm, function(results, fields) {
      return res.send(results);
    });
  }
};

module.exports = dbwork;
