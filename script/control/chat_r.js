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

router.get('/getMbrBefore', function(req, res) {
  return dbwork.getMbrBefore(req, res);
});

router.get('/getMbrAfter', function(req, res) {
  return dbwork.getMbrAfter(req, res);
});

module.exports = router;
