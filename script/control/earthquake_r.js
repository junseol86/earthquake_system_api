var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./earthquake_d');

router.get('/getList', function(req, res) {
  return dbwork.getList(req, res);
});

router.post('/insert', function(req, res) {
  return dbwork.insert(req, res);
});

router.post('/delete', function(req, res) {
  return dbwork.delete(req, res);
});

router.put('/activeToggle', function(req, res) {
  return dbwork.activeToggle(req, res);
});

router.post('/sendEqNotification', function(req, res) {
  return dbwork.sendEqNotification(req, res);
});

router.get('/runningCheck', function(req, res) {
  return res.send([dbwork.checkEqStr]);
});

module.exports = router;
