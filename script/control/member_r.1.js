var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./member_d');

router.get('/idxExists', function(req, res) {
  console.log(req.params.idx);
  console.log(req.params);
  return dbwork.checkMemberIdxExists(req, res, req.get('idx'), function() {
    return console.log('DONE');
  });
});

module.exports = router;
