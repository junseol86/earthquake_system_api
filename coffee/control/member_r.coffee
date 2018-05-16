express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './member_d'

router.get '/idxExists', (req, res) ->
  console.log req.params.idx
  console.log req.params
  dbwork.checkMemberIdxExists req, res, req.get('idx'), () ->
    console.log('DONE')

module.exports = router