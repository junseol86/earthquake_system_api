var dbwork, express, router;

express = require('express');

router = express.Router();

dbwork = require('./spot_d');

router.get('/getList', function(req, res) {
  return dbwork.getList(req, res);
});

module.exports = router;
