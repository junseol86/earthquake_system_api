var db, dbwork, fcm, member, parseXml, request, secret, util;

db = require('../tool/mysql');

member = require('./member_d');

util = require('./../tool/util');

fcm = require('./../tool/fcm');

request = require('request');

secret = require('./../tool/secret');

parseXml = require('xml2js').parseString;

// xmlParser = require 'xml-parser'
// xmlParser = require 'xml-js'
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
  checkEq: function() {
    var _3DaysAgo, eqFrom, eqTo, today, url;
    today = new Date();
    _3DaysAgo = new Date();
    _3DaysAgo.setDate(today.getDate() - 30);
    eqFrom = `${_3DaysAgo.getFullYear()}${(_3DaysAgo.getMonth() > 8 ? '' : '0')}${_3DaysAgo.getMonth() + 1}${(_3DaysAgo.getDate() > 9 ? '' : '0')}${_3DaysAgo.getDate()}`;
    eqTo = `${today.getFullYear()}${(today.getMonth() > 8 ? '' : '0')}${today.getMonth() + 1}${(today.getDate() > 9 ? '' : '0')}${today.getDate()}`;
    url = `http://newsky2.kma.go.kr/service/ErthqkInfoService/EarthquakeReport? serviceKey=${secret.dataKrKey} &numOfRows=${10} &pageSize=${10} &pageNo=${1} &startPage=${1} &fromTmFc=${eqFrom} &toTmFc=${eqTo}`.replace(/\s/g, '');
    console.log(url);
    return request({
      url: url,
      method: 'GET'
    }, function(error, response, body) {
      var bodyStr;
      bodyStr = body;
      // bodyStr = secret.sampleResponse
      return parseXml(bodyStr, function(error, result) {
        var data, eqObj, item, totalCount;
        data = result.response.body[0];
        console.log(data);
        totalCount = Number(data.totalCount[0]);
        if (totalCount > 0) {
          item = data.items[0].item[0];
          console.log(item);
          eqObj = {
            eq_tm_fc: item.tmFc[0],
            eq_type: item.loc[0].includes('해역') ? 'waters' : 'inland',
            eq_strength: item.mt[0],
            latitude: item.lat[0],
            longitude: item.lon[0]
          };
          return console.log(eqObj);
        }
      });
    });
  }
};

module.exports = dbwork;
