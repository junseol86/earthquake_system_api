var db, dbwork;

db = require('../tool/mysql');

dbwork = {
  // 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: function(req, res, idx, func) {
    return db.query('SELECT COUNT(*) FROM member WHERE mbr_idx = ?', [idx], function(results, fields) {
      console.log(idx);
      console.log(results);
      console.log(fields);
      func();
      return res.send(results);
    });
  },
  // 멤버 아이디 존재 여부 확인
  checkIdExists: function(req, res, email, func) {}
};

module.exports = dbwork;
