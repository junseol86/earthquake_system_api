var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./structure_d');

router.get('/getList', function(req, res) {
  return dbwork.getList(req, res);
});

router.post('/insert', function(req, res) {
  return dbwork.insert(req, res);
});

router.put('/modify', function(req, res) {
  return dbwork.modify(req, res);
});

router.put('/report', function(req, res) {
  return dbwork.report(req, res);
});

router.post('/requestReport', function(req, res) {
  return dbwork.requestReport(req, res);
});

router.post('/delete', function(req, res) {
  return dbwork.delete(req, res);
});

router.post('/smsParseAlarm', function(req, res) {
  return dbwork.smsParseAlarm(req, res);
});

module.exports = router;
