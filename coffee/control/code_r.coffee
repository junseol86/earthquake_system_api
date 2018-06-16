express = require 'express'
router = express.Router()
dbwork = require './code_d'

router.get '/getRegisterCode', (req, res) ->
  dbwork.getRegisterCode req, res

router.put '/modify', (req, res) ->
  dbwork.modify req, res

module.exports = router