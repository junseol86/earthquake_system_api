express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './earthquake_d'

router.get '/getList', (req, res) ->
  dbwork.getList req, res

router.post '/insert', (req, res) ->
  dbwork.insert req, res

router.post '/delete', (req, res) ->
  dbwork.delete req, res

module.exports = router