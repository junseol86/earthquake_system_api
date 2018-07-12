var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./chat_d');

router.get('/getHqBefore/:chtIdx', function(req, res) {
  return dbwork.getHqBefore(req, res);
});

router.get('/getHqAfter/:chtIdx', function(req, res) {
  return dbwork.getHqAfter(req, res);
});

router.post('/insertHq', function(req, res) {
  return dbwork.insertHq(req, res);
});

router.get('/getMbrBefore/:chtIdx', function(req, res) {
  return dbwork.getMbrBefore(req, res);
});

router.get('/getMbrAfter/:chtIdx', function(req, res) {
  return dbwork.getMbrAfter(req, res);
});

router.post('/insertMbr', function(req, res) {
  return dbwork.insertMbr(req, res);
});

router.get('/fcmtest', function(req, res) {
  return dbwork.sendFCM(req, res);
});

module.exports = router;
