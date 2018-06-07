express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './structure_d'

router.get '/getList', (req, res) ->
  dbwork.getList req, res

router.post '/insert', (req, res) ->
  dbwork.insert req, res

module.exports = router