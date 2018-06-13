var db, dbwork, member;

db = require('../tool/mysql');

member = require('./member_d');

dbwork = {
  // 코드 받기
  getCode: function(req, res) {
    return db.query(res, 'SELECT cd_code FROM eq_code WHERE cd_name = ?', [req.headers.code], function(results, fields) {
      return res.send(results[0]);
    });
  },
  // 코드 변경
  modify: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var result;
      result = {
        jwtToken: jwtToken
      };
      return db.query(res, 'UPDATE eq_code SET cd_code = ? WHERE cd_name = ?', [req.body.code, req.body.name], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  }
};

module.exports = dbwork;
