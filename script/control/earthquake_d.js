var db, dbwork, fcm, member, parseXml, request, secret, util;

db = require('../tool/mysql');

member = require('./member_d');

util = require('./../tool/util');

fcm = require('./../tool/fcm');

request = require('request');

secret = require('./../tool/secret');

parseXml = require('xml2js').parseString;

dbwork = {
  // 지진 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_earthquake ORDER BY eq_idx DESC', [], function(results, fields) {
      results.map(function(eq) {
        return util.evalEq(eq);
      });
      return res.send(results);
    });
  },
  // 지진 하나 다운
  getOneByIdx: function(req, res, eq_idx, func) {
    return db.query(res, 'SELECT * FROM eq_earthquake WHERE eq_idx = ?', [eq_idx], function(results, fields) {
      return func(results[0]);
    });
  },
  // 지진 입력
  insert: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var insQr, result;
      result = {
        jwtToken: jwtToken
      };
      insQr = 'INSERT INTO eq_earthquake (eq_type, eq_strength, latitude, longitude) VALUES (?, ?, ?, ?)';
      return db.query(res, insQr, [req.body.type, req.body.strength, req.body.lat, req.body.lng], function(results, fields) {
        result.success = results.affectedRows > 0;
        if (!result.success) {
          return res.send(result);
        } else {
          return _this.getOneByIdx(req, res, results.insertId, function(earthquake) {
            result.eq_earthquake = earthquake;
            return res.send(result);
          });
        }
      });
    });
  },
  // 지진 삭제 
  delete: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var delQr, result;
      result = {
        jwtToken: jwtToken
      };
      delQr = 'DELETE FROM eq_earthquake WHERE eq_idx = ?';
      return db.query(res, delQr, [req.body.eq_idx], function(results, fields) {
        result.success = results.affectedRows > 0;
        return res.send(result);
      });
    });
  },
  //지진 진행/종료
  activeToggle: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var allOffQr, result;
      result = {
        jwtToken: jwtToken
      };
      allOffQr = 'UPDATE eq_earthquake SET eq_active = 0';
      return db.query(res, allOffQr, [], function(results, fields) {
        var actvQr;
        result.success = results.affectedRows > 0;
        if (req.body.set === '0') {
          return res.send(result);
        } else {
          actvQr = 'UPDATE eq_earthquake SET eq_active = 1 WHERE eq_idx = ?';
          return db.query(res, actvQr, [req.body.eq_idx], function(results, fields) {
            result.success = results.affectedRows > 0;
            return res.send(result);
          });
        }
      });
    });
  },
  //지진 알림 보내기
  sendEqNotification: function(req, res) {
    var _this;
    _this = this;
    return member.tokenCheck(req, res, function(jwtToken) {
      var level, ntfStr, result, type;
      result = {
        jwtToken: jwtToken
      };
      level = req.body.level === 0 ? '자체대응' : req.body.level === 1 ? '대응 1단계' : '대응 2단계';
      type = req.body.type === 'inland' ? '내륙' : '해역';
      ntfStr = "SELECT * FROM eq_member";
      return db.query(res, ntfStr, [], function(results, fields) {
        results.map(function(mbr) {
          if (mbr.mbr_fcm.length > 0) {
            return fcm.sendFCM(mbr.mbr_fcm, 'earthquake', `지진발생 [${level}]`, `${type} ${req.body.strength}`);
          }
        });
        return res.send(result);
      });
    });
  },
  // 지진체킹 돌고 있는지 확인하는 지표
  checkEqCount: 0,
  checkEqStr: '',
  
  // 새 지진 여부 체크
  checkEq: function() {
    var _3DaysAgo, _this, eqFrom, eqTo, today, url;
    _this = this;
    _this.checkEqCount = (_this.checkEqCount + 1) % 100;
    today = new Date();
    _3DaysAgo = new Date();
    _3DaysAgo.setDate(today.getDate() - 3);
    today.setDate(today.getDate() + 1);
    eqFrom = `${_3DaysAgo.getFullYear()}${(_3DaysAgo.getMonth() > 8 ? '' : '0')}${_3DaysAgo.getMonth() + 1}${(_3DaysAgo.getDate() > 9 ? '' : '0')}${_3DaysAgo.getDate()}`;
    eqTo = `${today.getFullYear()}${(today.getMonth() > 8 ? '' : '0')}${today.getMonth() + 1}${(today.getDate() > 9 ? '' : '0')}${today.getDate()}`;
    url = `http://newsky2.kma.go.kr/service/ErthqkInfoService/EarthquakeReport? serviceKey=${secret.dataKrKey} &numOfRows=${10} &pageSize=${10} &pageNo=${1} &startPage=${1} &fromTmFc=${eqFrom} &toTmFc=${eqTo}`.replace(/\s/g, '');
    // console.log url
    return request({
      url: url,
      method: 'GET'
    }, function(error, response, body) {
      var bodyStr;
      bodyStr = body;
      _this.checkEqStr = `${_this.checkEqCount} | ${eqFrom} ~ ${eqTo} | ${bodyStr}`;
      // bodyStr = secret.sampleResponse2
      return parseXml(bodyStr, function(error, result) {
        var data, eqObj, item, latitudeNum, longitudeNum, qrStr, totalCount, weak;
        data = result.response.body[0];
        // console.log data
        totalCount = Number(data.totalCount[0]);
        if (totalCount === 0) {
          return;
        }
        // 3일 내 발생한 지진이 있다면
        item = data.items[0].item[0];
        // console.log item
        eqObj = {
          eq_tm_fc: item.tmFc[0],
          eq_type: item.loc[0].includes('해역') ? 'waters' : 'inland',
          eq_strength: item.mt[0],
          latitude: item.lat[0],
          longitude: item.lon[0]
        };
        _this.checkEqStr += ` | ${JSON.stringify(eqObj)}`;
        latitudeNum = Number(eqObj.latitude);
        longitudeNum = Number(eqObj.longitude);
        if (!((38.47722 > latitudeNum && latitudeNum > 33.6586)) || !((130.9597 > longitudeNum && longitudeNum > 123.1278))) {
          return;
        }
        //  대처해야 하는 강도의 지진 여부
        weak = false;
        if (eqObj.eq_strength < 3.5 || (eqObj.eq_type === 'waters' && eqObj.eq_strength < 4)) {
          weak = true;
        }
        // 테이블에 저장된 지진인지 확인
        qrStr = `SELECT COUNT(*) as count FROM ${(weak ? 'eq_earthquake_weak' : 'eq_earthquake')} WHERE eq_tm_fc = ?`;
        return db.query(null, qrStr, [eqObj.eq_tm_fc], function(results, fields) {
          var found, udtStr;
          found = results[0].count;
          if (found > 0) {
            return;
          }
          // 새로운 지진이라면 테이블에 저장
          udtStr = `UPDATE eq_earthquake SET eq_active = 0 ${(weak ? 'WHERE eq_idx = -1' : '')}`;
          return db.query(null, udtStr, [], function(results, params) {
            var insPrms, insStr;
            insStr = `INSERT INTO ${(weak ? 'eq_earthquake_weak' : 'eq_earthquake')} (eq_active, eq_type, eq_strength, latitude, longitude, eq_tm_fc) VALUES (1, ?, ?, ?, ?, ?)`;
            insPrms = [eqObj.eq_type, eqObj.eq_strength, eqObj.latitude, eqObj.longitude, eqObj.eq_tm_fc];
            return db.query(null, insStr, insPrms, function(results, fields) {
              var insSuccess, level, ntfStr, ref, ref1, ref2, ref3, type;
              insSuccess = results.affectedRows > 0;
              if (!insSuccess) {
                return;
              }
              // 저장에 성공했다면
              if (weak) {
                return;
              }
              // 그리고 대처해야 하는 강도의 지진이라면 신호 보냄
              level = '';
              type = '';
              if (eqObj.eq_type === 'inland') {
                type = '내륙';
                if ((3.5 <= (ref = eqObj.eq_strength) && ref < 4)) {
                  level = '자체대응';
                }
                if ((4 <= (ref1 = eqObj.eq_strength) && ref1 < 5)) {
                  level = '대응 1단계';
                }
                if (eqObj.eq_strength >= 5) {
                  level = '대응 2단계';
                }
              }
              if (eqObj.eq_type === 'waters') {
                type = '해역';
                if ((4 <= (ref2 = eqObj.eq_strength) && ref2 < 4.5)) {
                  level = '자체대응';
                }
                if ((4.5 <= (ref3 = eqObj.eq_strength) && ref3 < 5.5)) {
                  level = '대응 1단계';
                }
                if (eqObj.eq_strength >= 5.5) {
                  level = '대응 2단계';
                }
              }
              ntfStr = "SELECT * FROM eq_member";
              return db.query(null, ntfStr, [], function(results, fields) {
                return results.map(function(mbr) {
                  if (mbr.mbr_fcm.length > 0) {
                    return fcm.sendFCM(mbr.mbr_fcm, 'earthquake', `지진발생 [${level}]`, `${type} ${eqObj.eq_strength}`);
                  }
                });
              });
            });
          });
        });
      });
    });
  }
};

module.exports = dbwork;
