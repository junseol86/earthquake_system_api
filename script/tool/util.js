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
