express = require 'express'
router = express.Router()
dbwork = require './spot_d'

router.get '/getList', (req, res) ->
  dbwork.getList req, res

module.exports = router