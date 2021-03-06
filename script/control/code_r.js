var dbwork, express, router;

express = require('express');

router = express.Router();

dbwork = require('./code_d');

router.get('/getRegisterCode', function(req, res) {
  return dbwork.getRegisterCode(req, res);
});

router.put('/modify', function(req, res) {
  return dbwork.modify(req, res);
});

module.exports = router;
