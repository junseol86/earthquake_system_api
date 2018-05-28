var db, dbwork;

db = require('../tool/mysql');

dbwork = {
  processData: function(data) {
    var _this;
    _this = this;
    return data.split('\n').map(function(datum) {
      var branch, lat, line, lng, name, pieces, query;
      query = '';
      pieces = datum.split(',');
      name = pieces[0];
      branch = pieces[1];
      line = pieces[2];
      lat = _this.toLatLng(pieces[3], pieces[4], pieces[5]);
      lng = _this.toLatLng(pieces[6], pieces[7], pieces[8]);
      query += "INSERT INTO eq_structure ";
      query += "(str_name, str_branch, str_line, str_latitude, str_longitude) ";
      query += "VALUES (";
      query += `'${name}', '${branch}', '${line}', '${lat}', '${lng}'`;
      query += ");";
      return db.query(query, [], function(result, fields) {
        return console.log(result);
      });
    });
  },
  toLatLng: function(doh, bun, cho) {
    return Number(doh) + ((Number(bun) + (Number(cho) / 60)) / 60);
  }
};

module.exports = dbwork;
