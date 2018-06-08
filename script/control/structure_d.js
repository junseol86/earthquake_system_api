var db, dbwork, member;

db = require('../tool/mysql');

member = require('./member_d');

dbwork = {
  // 구조물 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_structure', [], function(results, fields) {
      return res.send(results);
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
