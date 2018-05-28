var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./structure_d');

router.get('/getList', function(req, res) {
  return dbwork.getList(req, res);
});

module.exports = router;
