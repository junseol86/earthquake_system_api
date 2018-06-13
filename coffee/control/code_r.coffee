express = require 'express'
router = express.Router()
dbwork = require './code_d'

router.get '/getCode', (req, res) ->
  dbwork.getCode req, res

router.put '/modify', (req, res) ->
  dbwork.modify req, res

module.exports = router