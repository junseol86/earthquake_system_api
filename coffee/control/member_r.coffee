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

router.get '/getList', (req, res) ->
  dbwork.getList req, res

router.put '/changeTeam', (req, res) ->
  dbwork.changeTeam req, res

router.put '/setFcmToken', (req, res) ->
  dbwork.setFcmToken req, res

router.post '/delete', (req, res) ->
  dbwork.delete req, res

router.post '/notifyTeam', (req, res) ->
  dbwork.notifyTeam req, res

router.post '/arrivalReport', (req, res) ->
  dbwork.arrivalReport req, res

router.post '/locationReport', (req, res) ->
  dbwork.locationReport req, res

module.exports = router