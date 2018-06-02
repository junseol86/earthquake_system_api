express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './member_d'

router.get '/idxExists', (req, res) ->
  dbwork.checkMemberIdxExists req, res, req.get('idx'), () ->
    console.log('DONE')

router.post '/register', (req, res) ->
  dbwork.register req, res

router.post '/passwordLogin', (req, res) ->
  dbwork.passwordLogin req, res

router.post '/tokenLogin', (req, res) ->
  dbwork.tokenLogin req, res

router.get '/getMembers', (req, res) ->
  dbwork.getMembers req, res

module.exports = router