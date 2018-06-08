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

router.post('/delete', function(req, res) {
  return dbwork.delete(req, res);
});

module.exports = router;
