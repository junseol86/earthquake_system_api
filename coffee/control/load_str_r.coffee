express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './load_str_d'

router.get '/load', (req, res) ->
  fs = require 'fs'
  data = fs.readFile '/Users/hyeonmin/GoogleBackup/_current/KyeongjuDoro/Api/eq-sys-api/kj_structures.csv', 'utf8', (error, data) ->
    dbwork.processData data

  res.send 'OK'

module.exports = router