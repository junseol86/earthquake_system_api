express = require 'express'
router = express.Router()
util = require '../tool/util'
dbwork = require './chat_d'

router.get '/getHqBefore/:chtIdx', (req, res) ->
  dbwork.getHqBefore req, res

router.get '/getHqAfter/:chtIdx', (req, res) ->
  dbwork.getHqAfter req, res

router.post '/insertHq', (req, res) ->
  dbwork.insertHq req, res

router.get '/getMbrBefore/:chtIdx', (req, res) ->
  dbwork.getMbrBefore req, res

router.get '/getMbrAfter/:chtIdx', (req, res) ->
  dbwork.getMbrAfter req, res

router.post '/insertMbr', (req, res) ->
  dbwork.insertMbr req, res

router.get '/fcmtest', (req, res) ->
  dbwork.sendFCM req, res

module.exports = router