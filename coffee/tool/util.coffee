dateformat = require 'dateformat'

exports.setDateProto = () ->
  Date.prototype.getTimeString = ->
    timeString = this.getFullYear() + "-"
    timeString += this.getMonth() + "-"
    timeString += this.getDate() + " "
    timeString += this.getHours() + ":"
    timeString += this.getMinutes() + ":"
    timeString += this.getSeconds()
    timeString

  Date.prototype.getTimedFileName = ->
    timeString = this.getFullYear() + "-"
    timeString += this.getMonth() + "-"
    timeString += this.getDate() + "_"
    timeString += this.getHours() + "-"
    timeString += this.getMinutes() + "-"
    timeString += this.getSeconds()
    timeString

randomChars = (length) ->
  result = ""
  letterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for [0..length - 1]
    result = result += letterSet[Math.floor(Math.random() * letterSet.length)]
  result

exports.createSalt = () ->
  randomChars(20)

exports.createToken = () ->
  randomChars(40)

exports.hashMD5 = (str) ->
  md5 = require('md5')
  return md5(str)

exports.dateBefore = (offset) ->
  date = new Date()
  date.setDate(date.getDate() - offset)
  dateformat date, 'yyyy-mm-dd HH:mm:ss'

exports.timeStamp = () ->
  dateformat(new Date(), 'yyyy-mm-dd HH:mm:ss')

exports.dateStamp = () ->
  dateformat(new Date(), 'yyyy-mm-dd')

exports.evalEq = (eq) ->
  if eq.eq_type = 'inland'
    if 3.5 <= eq.eq_strength < 4
      eq.eq_level = 0
    else if 4 <= eq.eq_strength < 5
      eq.eq_level = 1
    else if 5 <= eq.eq_strength
      eq.eq_level = 2
  else if eq.eq_type = 'waters'
    if 4 <= eq.eq_strength < 4.5
      eq.eq_level = 0
    else if 4.5 <= eq.eq_strength < 5.5
      eq.eq_level = 1
    else if 5.5 <= eq.eq_strength
      eq.eq_level = 2

exports.degToRad = (deg) ->
  deg * Math.PI / 180

exports.distBwCoords = (lat1, lng1, lat2, lng2) ->
  eqR_km = 6371
  dLat = this.degToRad(lat2 - lat1)
  dLng = this.degToRad(lng2 - lng1)
  lat1 = this.degToRad lat1
  lat2 = this.degToRad lat2
  a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2)
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  eqR_km * c
