var db, dbwork, earthquake, fcm, member, util;

db = require('../tool/mysql');

member = require('./member_d');

earthquake = require('./earthquake_d');

util = require('./../tool/util');

fcm = require('./../tool/fcm');

dbwork = {
  // 구조물 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_structure ORDER BY str_rpt_prior DESC, str_name ASC', [], function(results, fields) {
      var structures;
      structures = results;
      return db.query(res, 'SELECT * FROM eq_earthquake where eq_active = 1', [], function(eqs, fields) {
        var eq;
        // 지진이 없는 상황
        if (eqs.length === 0) {
          structures.map(function(structure) {
            return structure.on_team = 0;
          });
          return res.send(structures);
        } else {
          // 지진 발생시
          eq = eqs[0];
          util.evalEq(eq);
          return res.send(util.assignStr(eq, structures));
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
      insQr = 'INSERT INTO eq_structure (str_branch, str_line, str_name, str_order, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)';
      return db.query(res, insQr, [req.body.branch, req.body.line, req.body.name, req.body.order, req.body.lat, req.body.lng], function(results, fields) {
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
      modQr = 'UPDATE eq_structure SET str_branch = ?, str_line = ?, str_name = ?, str_order = ?, str_rpt_prior = ?, str_spec = ?, str_need_check = ?, latitude = ?, longitude = ? WHERE str_idx = ?';
      return db.query(res, modQr, [req.body.str_branch, req.body.str_line, req.body.str_name, req.body.str_order, req.body.str_rpt_prior, req.body.str_spec, req.body.str_need_check, req.body.latitude, req.body.longitude, req.body.str_idx], function(results, fields) {
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
  // 구조물 보고
  report: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var result, rptQr;
      result = {
        jwtToken: jwtToken
      };
      rptQr = 'UPDATE eq_structure SET str_report = ?, str_last_reported = NOW() WHERE str_idx = ?';
      return db.query(res, rptQr, [req.body.str_report, req.body.str_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  //구조물 보고 요청 알람
  requestReport: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var ntfStr, result;
      result = {
        jwtToken: jwtToken
      };
      ntfStr = "SELECT * FROM eq_member";
      return db.query(res, ntfStr, [], function(results, fields) {
        results.map(function(mbr) {
          if (mbr.mbr_fcm.length > 0) {
            return fcm.sendFCM(mbr.mbr_fcm, 'structure', '구조물 점검, 보고할 것', req.body.str_name);
          }
        });
        return res.send(result);
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
