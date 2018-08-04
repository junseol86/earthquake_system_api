db = require '../tool/mysql'
util = require '../tool/util'
secret = require '../tool/secret'
jwt = require 'jsonwebtoken';
# winston = require '../tool/winston'
fcm = require './../tool/fcm'

dbwork = {

  # member_d 와 code_d가 서로를  require 할 때 생기는 에러 때문에, 토큰 체크 기능만 따로 빼어 code_d에 로드되기 위한 파일

  # 토큰 갱신
  replaceToken: (res, member, func) ->
    _this = this    
    # 현 토큰 삭제
    delQrStr = "DELETE FROM eq_token WHERE tkn_mbr_idx = ?"
    db.query res, delQrStr, [member.mbr_idx], (results_1, fields) ->
      # 새 토큰 발급
      insQrStr = "INSERT INTO eq_token (tkn_mbr_idx, tkn_token) VALUES (?, ?)"
      token = util.createToken()
      db.query res, insQrStr, [member.mbr_idx, token], (results_2, fields) ->
        jwtToken = jwt.sign {
          mbr_idx: member.mbr_idx,
          mbr_name: member.mbr_name,
          mbr_team: member.mbr_team,
          token: token,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, secret.jwtSecret
        func jwtToken

  # JWT 토큰 디코드
  decodeJwt: (req, res, func) ->
    _this = this    
    jwtToken = req.body.jwtToken
    decoded = jwt.verify jwtToken, secret.jwtSecret, (error, decoded) ->
      if error
        # winston.errorLog 'JWT TOKEN ERROR', error.stack
        res.status(401).send {
          result: '토큰 에러입니다.  앱을 다시 실행해주세요.'
        }
      else
        _this.replaceToken res, decoded, (jwtToken) ->
          func jwtToken

  # 토큰 확인
  tokenCheck: (req, res, func) ->
    _this = this
    _this.decodeJwt req, res, (jwtToken) ->
      func jwtToken


  # 토큰 로그인
  tokenLogin: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      res.send jwtToken

}

module.exports = dbwork