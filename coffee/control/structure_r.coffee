express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './structure_d'

router.get '/getList', (req, res) ->
  dbwork.getList req, res

router.post '/insert', (req, res) ->
  dbwork.insert req, res

router.put '/modify', (req, res) ->
  dbwork.modify req, res

router.put '/report', (req, res) ->
  dbwork.report req, res

router.post '/requestReport', (req, res) ->
  dbwork.requestReport req, res

router.post '/delete', (req, res) ->
  dbwork.delete req, res

module.exports = router