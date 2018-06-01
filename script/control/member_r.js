var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./member_d');

router.get('/idxExists', function(req, res) {
  return dbwork.checkMemberIdxExists(req, res, req.get('idx'), function() {
    return console.log('DONE');
  });
});

router.post('/register', function(req, res) {
  return dbwork.register(req, res);
});

router.post('/passwordLogin', function(req, res) {
  return dbwork.passwordLogin(req, res);
});

router.post('/tokenLogin', function(req, res) {
  return dbwork.tokenLogin(req, res);
});

module.exports = router;
