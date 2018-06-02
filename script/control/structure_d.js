var db, dbwork;

db = require('../tool/mysql');

dbwork = {
  // 구조물 리스트 다운
  getList: function(req, res) {
    return db.query(res, 'SELECT * FROM eq_structure', [], function(results, fields) {
      return res.send(results);
    });
  }
};

module.exports = dbwork;
