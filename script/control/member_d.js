var code, db, dbwork, fcm, jwt, secret, util, winston;

db = require('../tool/mysql');

util = require('../tool/util');

secret = require('../tool/secret');

jwt = require('jsonwebtoken');

winston = require('../tool/winston');

code = require('./code_d');

fcm = require('./../tool/fcm');

dbwork = {
  // 토큰(테이블에 저장되는 값) JWT 토큰 구분할 것

  // 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: function(req, res, idx, func) {
    var qrStr;
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_idx = ?';
    return db.query(res, qrStr, [idx], function(results, fields) {
      func();
      return res.send(results);
    });
  },
  // 멤버 아이디 존재 여부 확인
  checkIdExists: function(req, res, func) {
    var qrStr;
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_id = ?';
    return db.query(res, qrStr, [req.body.mbr_id], function(results, fields) {
      return func(results, fields);
    });
  },
  // 멤버 아이디로 멤버 검색
  findMemberById: function(req, res, func) {
    var qrStr;
    qrStr = 'SELECT * FROM eq_member WHERE mbr_id = ?';
    return db.query(res, qrStr, [req.body.mbr_id], function(results, fields) {
      return func(results, fields);
    });
  },
  
  // 회원 생성
  register: function(req, res) {
    var _this;
    _this = this;
    return code.getCode('register', res, function(result) {
      if (result.cd_code !== req.body.code) {
        return res.status(403).send({
          result: '가입코드를 확인하세요.'
        });
      } else {
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
            qrStr = 'INSERT INTO eq_member (mbr_id, mbr_salt, mbr_hash, mbr_name, mbr_phone) VALUES (?, ?, ?, ?, ?)';
            return db.query(res, qrStr, [req.body.mbr_id, salt, hash, req.body.mbr_name, req.body.mbr_phone], function(results, fields) {
              return res.send({
                result: results.affectedRows > 0 ? 'SUCCESS' : 'FAIL'
              });
            });
          }
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
          return _this.replaceToken(res, results_0[0], function(jwtToken) {
            return res.send(jwtToken);
          });
        }
      }
    });
  },
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
        winston.errorLog('JWT TOKEN ERROR', error.stack);
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
  },
  // 멤버들 전체 명단 받기
  getList: function(req, res) {
    var _this, selectStr;
    _this = this;
    selectStr = "SELECT mbr_idx, mbr_id, mbr_name, mbr_phone, mbr_team, mbr_arrive_in, mbr_arr_last_report, latitude, longitude, mbr_pos_last_report FROM eq_member";
    return db.query(res, selectStr, [], function(results, fields) {
      return res.send(results);
    });
  },
  // 멤버 팀 바꾸기
  changeTeam: function(req, res) {
    var _this;
    _this = this;
    return _this.tokenCheck(req, res, function(jwtToken) {
      var modTeamStr, result;
      result = {
        jwtToken: jwtToken
      };
      modTeamStr = "UPDATE eq_member SET mbr_team = ? WHERE mbr_idx = ?";
      return db.query(res, modTeamStr, [req.body.team, req.body.mbr_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  // 멤버 FCM 토큰 설정
  setFcmToken: function(req, res) {
    var _this;
    _this = this;
    return _this.tokenCheck(req, res, function(jwtToken) {
      var result, setStr;
      result = {
        jwtToken: jwtToken
      };
      setStr = "UPDATE eq_member SET mbr_fcm = ? WHERE mbr_idx = ?";
      return db.query(res, setStr, [req.body.mbr_fcm, req.body.mbr_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  // 멤버 삭제
  delete: function(req, res) {
    var _this;
    _this = this;
    return _this.tokenCheck(req, res, function(jwtToken) {
      var delQr, result;
      result = {
        jwtToken: jwtToken
      };
      delQr = 'DELETE FROM eq_member WHERE mbr_idx = ?';
      return db.query(res, delQr, [req.body.mbr_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  // 조 구성 알림
  notifyTeam: function(req, res) {
    var _this;
    _this = this;
    return _this.tokenCheck(req, res, function(jwtToken) {
      var ntfStr, result;
      result = {
        jwtToken: jwtToken
      };
      ntfStr = "SELECT * FROM eq_member";
      return db.query(res, ntfStr, [], function(results, fields) {
        results.map(function(mbr) {
          var teamStr;
          if (mbr.mbr_fcm.length > 0) {
            teamStr = '조가 배정되지 않았습니다.';
            if (mbr.mbr_team > 0) {
              teamStr = mbr.mbr_team + '조입니다.';
            }
            return fcm.sendFCM(mbr.mbr_fcm, 'team', '조 구성 변경', teamStr);
          }
        });
        return res.send(result);
      });
    });
  }
};

module.exports = dbwork;
