var db, dbwork, jwt, secret, util;

db = require('../tool/mysql');

util = require('../tool/util');

secret = require('../tool/secret');

jwt = require('jsonwebtoken');

dbwork = {
  // 토큰(테이블에 저장되는 값) JWT 토큰 구분할 것

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
    // 중복 아이디 체크
    return _this.checkIdExists(req, res, function(results, fields) {
      var hash, qrStr, salt;
      if (results[0].count > 0) {
        return res.status(403).send({
          result: '중복되는 아이디가 있습니다.'
        });
      } else {
        // 솔트와 해시 생성 뒤 계정 생성
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
    // 아이디 존재 여부 확인
    return _this.findMemberById(req, res, function(results_0, fields) {
      if (results_0.length === 0) {
        return res.status(403).send({
          result: '존재하지 않는 아이디입니다.'
        });
      } else {
        // 솔트와 해시로 패스워드 확인
        if (util.hashMD5(req.body['password'] + results_0[0].mbr_salt) !== results_0[0].mbr_hash) {
          return res.status(403).send({
            result: '비밀번호를 확인해주세요.'
          });
        } else {
          return _this.replaceToken(result_0, fields, function(jwtToken) {
            return res.send(jwtToken);
          });
        }
      }
    });
  },
  // 토큰 갱신
  replaceToken: function(mbr_idx, func) {
    var delQrStr;
    // 현 토큰 삭제
    delQrStr = "DELETE FROM eq_token WHERE tkn_mbr_idx = ?";
    return db.query(delQrStr, [mbr_idx], function(results_1, fields) {
      var insQrStr, token;
      // 새 토큰 발급
      insQrStr = "INSERT INTO eq_token (tkn_mbr_idx, tkn_token) VALUES (?, ?)";
      token = util.createToken();
      return db.query(insQrStr, [mbr_idx, token], function(results_2, fields) {
        var jwtToken;
        jwtToken = jwt.sign({
          mbr_idx: mbr_idx,
          token: token,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, secret.jwtSecret);
        return func(jwtToken);
      });
    });
  },
  // JWT 토큰 디코드
  decodeJwt: function(req, res, func) {
    var _this, decoded, jwtToken;
    _this = this;
    jwtToken = req.body.jwtToken;
    return decoded = jwt.verify(jwtToken, secret.jwtSecret, function(error, decoded) {
      if (error) {
        console.error('error jwt token' + error.stack);
        return res.status(401).send('JWT TOKEN ERROR');
      } else {
        return _this.replaceToken(decoded.mbr_idx, function(jwtToken) {
          return func(jwtToken);
        });
      }
    });
  },
  // 토큰 확인
  tokenCheck: function(req, res, func) {
    var _this;
    _this = this;
    return _this.decodeJwt(req, res, function(jwtToken) {
      return func(jwtToken);
    });
  },
  // 토큰 로그인
  tokenLogin: function(req, res) {
    var _this;
    _this = this;
    return _this.tokenCheck(req, res, function(jwtToken) {
      return res.send(jwtToken);
    });
  }
};

module.exports = dbwork;
