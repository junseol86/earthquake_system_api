var dbwork, express, router, util;

express = require('express');

router = express.Router();

util = require('../tool/util');

dbwork = require('./load_str_d');

router.get('/load', function(req, res) {
  var data, fs;
  fs = require('fs');
  data = fs.readFile('/Users/hyeonmin/GoogleBackup/_current/KyeongjuDoro/Api/eq-sys-api/kj_structures.csv', 'utf8', function(error, data) {
    return dbwork.processData(data);
  });
  return res.send('OK');
});

module.exports = router;
