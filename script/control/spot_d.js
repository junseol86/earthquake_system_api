var db, dbwork, member;

db = require('../tool/mysql');

member = require('./member_d');

dbwork = {
  // 코드 받기
  getList: function(code, res) {
    return db.query(res, 'SELECT * FROM eq_spot', [], function(results, fields) {
      return res.send(results);
    });
  }
};

module.exports = dbwork;
