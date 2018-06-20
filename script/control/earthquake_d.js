var db, dbwork, member, util;

db = require('../tool/mysql');

member = require('./member_d');

util = require('./../tool/util');

dbwork = {
  // 지진 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_earthquake ORDER BY eq_idx DESC', [], function(results, fields) {
      results.map(function(eq) {
        return util.evalEq(eq);
      });
      return res.send(results);
    });
  },
  // 지진 하나 다운
  getOneByIdx: function(req, res, eq_idx, func) {
    return db.query(res, 'SELECT * FROM eq_earthquake WHERE eq_idx = ?', [eq_idx], function(results, fields) {
      return func(results[0]);
    });
  },
  // 지진 입력
  insert: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_earthquake (eq_type, eq_strength, latitude, longitude) VALUES (?, ?, ?, ?)';
      return db.query(res, insQr, [req.body.type, req.body.strength, req.body.lat, req.body.lng], function(results, fields) {
        result.success = results.affectedRows > 0;
        if (!result.success) {
          return res.send(result);
        } else {
          return _this.getOneByIdx(req, res, results.insertId, function(earthquake) {
            result.eq_earthquake = earthquake;
            return res.send(result);
          });
        }
      });
    });
  },
  // 지진 삭제 
  delete: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var delQr, result;
      result = {
        jwtToken: jwtToken
      };
      delQr = 'DELETE FROM eq_earthquake WHERE eq_idx = ?';
      return db.query(res, delQr, [req.body.eq_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  //지진 진행/종료
  activeToggle: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var allOffQr, result;
      result = {
        jwtToken: jwtToken
      };
      allOffQr = 'UPDATE eq_earthquake SET eq_active = 0';
      return db.query(res, allOffQr, [], function(results, fields) {
        var actvQr;
        result.success = results.affectedRows > 0;
        if (req.body.set === '0') {
          return res.send(result);
        } else {
          actvQr = 'UPDATE eq_earthquake SET eq_active = 1 WHERE eq_idx = ?';
          return db.query(res, actvQr, [req.body.eq_idx], function(results, fields) {
            result.success = results.affectedRows > 0;
            return res.send(result);
          });
        }
      });
    });
  }
};

module.exports = dbwork;
