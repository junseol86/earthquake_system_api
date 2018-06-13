var dbwork, express, router;

express = require('express');

router = express.Router();

dbwork = require('./code_d');

router.get('/getCode', function(req, res) {
  return dbwork.getCode(req, res);
});

router.put('/modify', function(req, res) {
  return dbwork.modify(req, res);
});

module.exports = router;
