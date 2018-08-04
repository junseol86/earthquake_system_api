var db, dbwork, fcm, jwt, secret, util;

db = require('../tool/mysql');

util = require('../tool/util');

secret = require('../tool/secret');

jwt = require('jsonwebtoken');

fcm = require('./../tool/fcm');

dbwork = {
  // member_d 와 code_d가 서로를  require 할 때 생기는 에러 때문에, 토큰 체크 기능만 따로 빼어 code_d에 로드되기 위한 파일

  // 토큰 갱신
  replaceToken: function(res, member, func) {
    var _this, delQrStr;
    _this = this;
    
    // 현 토큰 삭제
    delQrStr = "DELETE FROM eq_token WHERE tkn_mbr_idx = ?";
    return db.query(res, delQrStr, [member.mbr_idx], function(results_1, fields) {
      var insQrStr, token;
      // 새 토큰 발급
      insQrStr = "INSERT INTO eq_token (tkn_mbr_idx, tkn_token) VALUES (?, ?)";
      token = util.createToken();
      return db.query(res, insQrStr, [member.mbr_idx, token], function(results_2, fields) {
        var jwtToken;
        jwtToken = jwt.sign({
          mbr_idx: member.mbr_idx,
          mbr_name: member.mbr_name,
          mbr_team: member.mbr_team,
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
        // winston.errorLog 'JWT TOKEN ERROR', error.stack
        return res.status(401).send({
          result: '토큰 에러입니다.  앱을 다시 실행해주세요.'
        });
      } else {
        return _this.replaceToken(res, decoded, function(jwtToken) {
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
