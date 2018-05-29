var db, dbwork, util;

db = require('../tool/mysql');

util = require('../tool/util');

dbwork = {
  // 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: function(req, res, idx, func) {
    var qrStr;
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_idx = ?';
    return db.query(qrStr, [idx], function(results, fields) {
      func();
      return res.send(results);
    });
  },
  // 멤버 아이디 존재 여부 확인
  checkIdExists: function(req, res, func) {
    var qrStr;
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_id = ?';
    return db.query(qrStr, [req.body.mbr_id], function(results, fields) {
      return func(results, fields);
    });
  },
  // 멤버 아이디로 멤버 검색
  findMemberById: function(req, res, func) {
    var qrStr;
    qrStr = 'SELECT * FROM eq_member WHERE mbr_id = ?';
    return db.query(qrStr, [req.body.mbr_id], function(results, fields) {
      return func(results, fields);
    });
  },
  
  // 회원 생성
  register: function(req, res) {
    var _this;
    _this = this;
    return _this.checkIdExists(req, res, function(results, fields) {
      var hash, qrStr, salt;
      if (results[0].count > 0) {
        return res.status(403).send({
          result: '중복되는 아이디가 있습니다.'
        });
      } else {
        salt = util.createSalt();
        hash = util.hashMD5(req.body.password + salt);
        qrStr = 'INSERT INTO eq_member (mbr_id, mbr_salt, mbr_hash, mbr_name) VALUES (?, ?, ?, ?)';
        return db.query(qrStr, [req.body.mbr_id, salt, hash, req.body.mbr_name], function(results, fields) {
          return res.send({
            result: results.affectedRows > 0 ? 'SUCCESS' : 'FAIL'
          });
        });
      }
    });
  },
  // 패스워드 로그인
  passwordLogin: function(req, res) {
    var _this;
    _this = this;
    return _this.findMemberById(req, res, function(results, fields) {
      if (results.length === 0) {
        return res.status(403).send({
          result: '존재하지 않는 아이디입니다.'
        });
      } else {
        if (util.hashMD5(req.body['password'] + results[0].mbr_salt) !== results[0].mbr_hash) {
          return res.status(403).send({
            result: '비밀번호를 확인해주세요.'
          });
        } else {
          return res.send({
            result: 'SUCCESS'
          });
        }
      }
    });
  }
};

module.exports = dbwork;
