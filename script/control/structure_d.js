var db, dbwork, earthquake, member, util;

db = require('../tool/mysql');

member = require('./member_d');

earthquake = require('./earthquake_d');

util = require('./../tool/util');

dbwork = {
  // 구조물 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_structure ORDER BY str_name ASC', [], function(results, fields) {
      var structures;
      structures = results;
      return db.query(res, 'SELECT * FROM eq_earthquake where eq_active = 1', [], function(eqs, fields) {
        var eq;
        if (eqs.length === 0) {
          structures.map(function(structure) {
            return structure.on_team = 0;
          });
          return res.send(structures);
        } else {
          eq = eqs[0];
          util.evalEq(eq);
          structures.map(function(str) {
            return console.log(util.distBwCoords(str.latitude, str.longitude, eq.latitude, eq.longitude));
          });
          return res.send(structures);
        }
      });
    });
  },
  // 구조물 하나 다운
  getOneByIdx: function(req, res, str_idx, func) {
    return db.query(res, 'SELECT * FROM eq_structure WHERE str_idx = ?', [str_idx], function(results, fields) {
      return func(results[0]);
    });
  },
  // 구조물 입력
  insert: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_structure (str_branch, str_line, str_name, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
      return db.query(res, insQr, [req.body.branch, req.body.line, req.body.name, req.body.lat, req.body.lng], function(results, fields) {
        result.success = results.affectedRows > 0;
        if (!result.success) {
          return res.send(result);
        } else {
          return _this.getOneByIdx(req, res, results.insertId, function(structure) {
            result.structure = structure;
            return res.send(result);
          });
        }
      });
    });
  },
  // 구조물 수정
  modify: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var modQr, result;
      result = {
        jwtToken: jwtToken
      };
      modQr = 'UPDATE eq_structure SET str_branch = ?, str_line = ?, str_name = ?, latitude = ?, longitude = ? WHERE str_idx = ?';
      return db.query(res, modQr, [req.body.str_branch, req.body.str_line, req.body.str_name, req.body.latitude, req.body.longitude, req.body.str_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        if (!result.success) {
          return res.send(result);
        } else {
          return _this.getOneByIdx(req, res, req.body.str_idx, function(structure) {
            result.structure = structure;
            return res.send(result);
          });
        }
      });
    });
  },
  // 구조물 삭제 
  delete: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var delQr, result;
      result = {
        jwtToken: jwtToken
      };
      delQr = 'DELETE FROM eq_structure WHERE str_idx = ?';
      return db.query(res, delQr, [req.body.str_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  }
};

module.exports = dbwork;
