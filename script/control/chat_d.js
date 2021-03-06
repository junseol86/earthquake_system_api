var db, dbwork, fcm, member, util;

db = require('../tool/mysql');

member = require('./member_d');

util = require('./../tool/util');

fcm = require('./../tool/fcm');

dbwork = {
  lastChtIdx: 0,
  getHqBefore: function(req, res) {
    var _this, chtIdx, firstParam, firstQuery, laterParam, laterQuery, prm, qr;
    _this = this;
    chtIdx = Number(req.params.chtIdx);
    firstQuery = 'SELECT * FROM eq_chat WHERE cht_from_idx = 0 OR cht_to != -1 ORDER BY cht_idx DESC LIMIT 30';
    firstParam = [];
    laterQuery = 'SELECT * FROM eq_chat WHERE (cht_from_idx = 0 OR cht_to != -1) AND cht_idx < ? ORDER BY cht_idx DESC LIMIT 30';
    laterParam = [chtIdx];
    qr = chtIdx === 0 ? firstQuery : laterQuery;
    prm = chtIdx === 0 ? firstParam : laterParam;
    return db.query(res, qr, prm, function(results, fields) {
      if (chtIdx === 0 && results.length > 0) {
        _this.lastChtIdx = Math.max(_this.lastChtIdx, results[0].cht_idx);
      }
      return res.send(results);
    });
  },
  getHqAfter: function(req, res) {
    var chtIdx, prm, qr;
    chtIdx = Number(req.params.chtIdx);
    if (this.lastChtIdx <= chtIdx) {
      return res.send([]);
    } else {
      qr = 'SELECT * FROM eq_chat WHERE (cht_from_idx = 0 OR cht_to != -1) AND cht_idx > ? ORDER BY cht_idx DESC';
      prm = [chtIdx];
      return db.query(res, qr, prm, function(results, fields) {
        return res.send(results);
      });
    }
  },
  insertHq: function(req, res) {
    var _this, rb;
    _this = this;
    rb = req.body;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insPrm, insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_chat (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text) VALUES (?, ?, ?, ?, ?, ?)';
      insPrm = [0, '상황실', rb.cht_to, rb.cht_to_team, rb.cht_to_name, rb.cht_text];
      return db.query(res, insQr, insPrm, function(results, fields) {
        result.success = results.affectedRows > 0;
        if (result.success) {
          _this.lastChtIdx = results.insertId;
          return _this.sendChatFcm(req, res, '상황실', result);
        } else {
          return res.send(result);
        }
      });
    });
  },
  getMbrBefore: function(req, res) {
    var _this, chtIdx, firstParam, firstQuery, laterParam, laterQuery, prm, qr, rh;
    _this = this;
    chtIdx = Number(req.params.chtIdx);
    rh = req.headers;
    firstQuery = 'SELECT * FROM eq_chat WHERE ( cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ? ) ORDER BY cht_idx DESC LIMIT 30';
    firstParam = [rh.mbr_team, rh.mbr_idx, rh.mbr_idx];
    laterQuery = 'SELECT * FROM eq_chat WHERE cht_idx < ? AND ( cht_to = 0 OR cht_to_team = ? OR cht_to = ? OR cht_from_idx = ? ) ORDER BY cht_idx DESC LIMIT 30';
    laterParam = [chtIdx, rh.mbr_team, rh.mbr_idx, rh.mbr_idx];
    qr = chtIdx === 0 ? firstQuery : laterQuery;
    prm = chtIdx === 0 ? firstParam : laterParam;
    return db.query(res, qr, prm, function(results, fields) {
      if (chtIdx === 0 && results.length > 0) {
        _this.lastChtIdx = Math.max(_this.lastChtIdx, results[0].cht_idx);
      }
      return res.send(results);
    });
  },
  getMbrAfter: function(req, res) {
    var chtIdx, prm, qr, rh;
    chtIdx = Number(req.params.chtIdx);
    if (this.lastChtIdx <= chtIdx) {
      return res.send([]);
    } else {
      rh = req.headers;
      qr = 'SELECT * FROM eq_chat WHERE cht_idx > ? AND ( cht_to = 0 OR cht_from_idx = ? OR cht_to_team = ? OR cht_to = ? ) ORDER BY cht_idx DESC';
      prm = [chtIdx, rh.mbr_idx, rh.mbr_team, rh.mbr_idx];
      return db.query(res, qr, prm, function(results, fields) {
        return res.send(results);
      });
    }
  },
  insertMbr: function(req, res) {
    var _this, rb;
    _this = this;
    rb = req.body;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insPrm, insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_chat (cht_from_idx, cht_from_name, cht_to, cht_to_team, cht_to_name, cht_text) VALUES (?, ?, ?, ?, ?, ?)';
      insPrm = [rb.cht_from_idx, rb.cht_from_name, rb.cht_to, rb.cht_to_team, '', rb.cht_text];
      return db.query(res, insQr, insPrm, function(results, fields) {
        result.success = results.affectedRows > 0;
        if (result.success) {
          _this.lastChtIdx = results.insertId;
          return _this.sendChatFcm(req, res, rb.cht_from_name, result);
        } else {
          return res.send(result);
        }
      });
    });
  },
  sendChatFcm: function(req, res, chtFrom, finalResult) {
    var _this, rb, tknPrm, tknQry;
    _this = this;
    rb = req.body;
    tknQry = '';
    tknPrm = [];
    if (rb.cht_to === '0') {
      tknQry = 'SELECT mbr_fcm FROM eq_member';
      tknPrm = [];
    } else if (rb.cht_to === '-1') {
      tknQry = 'SELECT mbr_fcm FROM eq_member WHERE mbr_team = ?';
      tknPrm = [rb.cht_to_team];
    } else {
      tknQry = 'SELECT mbr_fcm FROM eq_member WHERE mbr_idx = ?';
      tknPrm = [rb.cht_to];
    }
    return db.query(res, tknQry, tknPrm, function(results, fields) {
      results.map(function(mbr) {
        if (mbr.mbr_fcm.length > 0) {
          return fcm.sendFCM(mbr.mbr_fcm, 'chat', chtFrom, rb.cht_text);
        }
      });
      return res.send(finalResult);
    });
  }
};

module.exports = dbwork;
