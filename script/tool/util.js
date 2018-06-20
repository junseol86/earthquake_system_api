var dateformat, randomChars;

dateformat = require('dateformat');

exports.setDateProto = function() {
  Date.prototype.getTimeString = function() {
    var timeString;
    timeString = this.getFullYear() + "-";
    timeString += this.getMonth() + "-";
    timeString += this.getDate() + " ";
    timeString += this.getHours() + ":";
    timeString += this.getMinutes() + ":";
    timeString += this.getSeconds();
    return timeString;
  };
  return Date.prototype.getTimedFileName = function() {
    var timeString;
    timeString = this.getFullYear() + "-";
    timeString += this.getMonth() + "-";
    timeString += this.getDate() + "_";
    timeString += this.getHours() + "-";
    timeString += this.getMinutes() + "-";
    timeString += this.getSeconds();
    return timeString;
  };
};

randomChars = function(length) {
  var i, letterSet, ref, result;
  result = "";
  letterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (i = 0, ref = length - 1; (0 <= ref ? i <= ref : i >= ref); 0 <= ref ? i++ : i--) {
    result = result += letterSet[Math.floor(Math.random() * letterSet.length)];
  }
  return result;
};

exports.createSalt = function() {
  return randomChars(20);
};

exports.createToken = function() {
  return randomChars(40);
};

exports.hashMD5 = function(str) {
  var md5;
  md5 = require('md5');
  return md5(str);
};

exports.dateBefore = function(offset) {
  var date;
  date = new Date();
  date.setDate(date.getDate() - offset);
  return dateformat(date, 'yyyy-mm-dd HH:mm:ss');
};

exports.timeStamp = function() {
  return dateformat(new Date(), 'yyyy-mm-dd HH:mm:ss');
};

exports.dateStamp = function() {
  return dateformat(new Date(), 'yyyy-mm-dd');
};

exports.evalEq = function(eq) {
  var ref, ref1, ref2, ref3;
  if (eq.eq_type = 'inland') {
    if ((3.5 <= (ref = eq.eq_strength) && ref < 4)) {
      return eq.eq_level = 0;
    } else if ((4 <= (ref1 = eq.eq_strength) && ref1 < 5)) {
      return eq.eq_level = 1;
    } else if (5 <= eq.eq_strength) {
      return eq.eq_level = 2;
    }
  } else if (eq.eq_type = 'waters') {
    if ((4 <= (ref2 = eq.eq_strength) && ref2 < 4.5)) {
      return eq.eq_level = 0;
    } else if ((4.5 <= (ref3 = eq.eq_strength) && ref3 < 5.5)) {
      return eq.eq_level = 1;
    } else if (5.5 <= eq.eq_strength) {
      return eq.eq_level = 2;
    }
  }
};

exports.degToRad = function(deg) {
  return deg * Math.PI / 180;
};

exports.distBwCoords = function(lat1, lng1, lat2, lng2) {
  var a, c, dLat, dLng, eqR_km;
  eqR_km = 6371;
  dLat = this.degToRad(lat2 - lat1);
  dLng = this.degToRad(lng2 - lng1);
  lat1 = this.degToRad(lat1);
  lat2 = this.degToRad(lat2);
  a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return eqR_km * c;
};
