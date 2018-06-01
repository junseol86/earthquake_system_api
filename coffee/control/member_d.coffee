db = require '../tool/mysql'
util = require '../tool/util'
secret = require '../tool/secret'
jwt = require 'jsonwebtoken';

dbwork = {

  # 토큰(테이블에 저장되는 값) JWT 토큰 구분할 것

  # 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: (req, res, idx, func) ->
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_idx = ?'
    db.query qrStr, [idx], (results, fields) ->
      func()
      res.send results

  # 멤버 아이디 존재 여부 확인
  checkIdExists: (req, res, func) ->
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_id = ?' 
    db.query qrStr, [req.body.mbr_id], (results, fields) ->
      func(results, fields)

  # 멤버 아이디로 멤버 검색
  findMemberById: (req, res, func) ->
    qrStr = 'SELECT * FROM eq_member WHERE mbr_id = ?' 
    db.query qrStr, [req.body.mbr_id], (results, fields) ->
      func(results, fields)
  
  # 회원 생성
  register: (req, res) ->
    _this = this
    # 중복 아이디 체크
    _this.checkIdExists req, res, (results, fields) ->
      if results[0].count > 0
        res.status(403).send {
          result: '중복되는 아이디가 있습니다.'
        }
      else
        # 솔트와 해시 생성 뒤 계정 생성
        salt = util.createSalt()
        hash = util.hashMD5(req.body.password + salt)
        qrStr = 'INSERT INTO eq_member (mbr_id, mbr_salt, mbr_hash, mbr_name) VALUES (?, ?, ?, ?)'
        db.query qrStr, [req.body.mbr_id, salt, hash, req.body.mbr_name], (results, fields) ->
          res.send {
            result: if results.affectedRows > 0 then 'SUCCESS' else 'FAIL'
          }

  # 패스워드 로그인
  passwordLogin: (req, res) ->
    _this = this
    # 아이디 존재 여부 확인
    _this.findMemberById req, res, (results_0, fields) ->
      if results_0.length == 0
        res.status(403).send {
          result: '존재하지 않는 아이디입니다.'
        }
      else
        # 솔트와 해시로 패스워드 확인
        if util.hashMD5(req.body['password'] + results_0[0].mbr_salt) != results_0[0].mbr_hash
          res.status(403).send {
            result: '비밀번호를 확인해주세요.'
          }
        else
          _this.replaceToken result_0, fields, (jwtToken) ->
            res.send jwtToken

  # 토큰 갱신
  replaceToken: (mbr_idx, func) ->
    # 현 토큰 삭제
    delQrStr = "DELETE FROM eq_token WHERE tkn_mbr_idx = ?"
    db.query delQrStr, [mbr_idx], (results_1, fields) ->
      # 새 토큰 발급
      insQrStr = "INSERT INTO eq_token (tkn_mbr_idx, tkn_token) VALUES (?, ?)"
      token = util.createToken()
      db.query insQrStr, [mbr_idx, token], (results_2, fields) ->
        jwtToken = jwt.sign {
          mbr_idx: mbr_idx,
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
        console.error('error jwt token' + error.stack)
        res.status(401).send 'JWT TOKEN ERROR'
      else
        _this.replaceToken decoded.mbr_idx, (jwtToken) ->
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