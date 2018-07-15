db = require '../tool/mysql'
util = require '../tool/util'
secret = require '../tool/secret'
jwt = require 'jsonwebtoken';
winston = require '../tool/winston'
code = require './code_d'
fcm = require './../tool/fcm'

dbwork = {

  # 토큰(테이블에 저장되는 값) JWT 토큰 구분할 것

  # 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: (req, res, idx, func) ->
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_idx = ?'
    db.query res, qrStr, [idx], (results, fields) ->
      func()
      res.send results

  # 멤버 아이디 존재 여부 확인
  checkIdExists: (req, res, func) ->
    qrStr = 'SELECT COUNT(*) count FROM eq_member WHERE mbr_id = ?' 
    db.query res, qrStr, [req.body.mbr_id], (results, fields) ->
      func(results, fields)

  # 멤버 아이디로 멤버 검색
  findMemberById: (req, res, func) ->
    qrStr = 'SELECT * FROM eq_member WHERE mbr_id = ?' 
    db.query res, qrStr, [req.body.mbr_id], (results, fields) ->
      func(results, fields)
  
  # 회원 생성
  register: (req, res) ->
    _this = this
    code.getCode 'register', res, (result) ->
      if result.cd_code != req.body.code
        res.status(403).send {
          result: '가입코드를 확인하세요.'
        }
      else
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
            qrStr = 'INSERT INTO eq_member (mbr_id, mbr_salt, mbr_hash, mbr_name, mbr_phone) VALUES (?, ?, ?, ?, ?)'
            db.query res, qrStr, [req.body.mbr_id, salt, hash, req.body.mbr_name, req.body.mbr_phone], (results, fields) ->
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
          _this.replaceToken res, results_0[0], (jwtToken) ->
            res.send jwtToken

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
        winston.errorLog 'JWT TOKEN ERROR', error.stack
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

  # 멤버들 전체 명단 받기
  getList: (req, res) ->
    _this = this
    selectStr = "SELECT 
      mbr_idx, mbr_id, mbr_name, mbr_phone, mbr_team, 
      mbr_arrive_in, mbr_arr_last_report,
      latitude, longitude, mbr_pos_last_report
     FROM eq_member"
    db.query res, selectStr, [], (results, fields) ->
      res.send results

  # 멤버 팀 바꾸기
  changeTeam: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      modTeamStr = "UPDATE eq_member SET mbr_team = ?
        WHERE mbr_idx = ?"
      db.query res, modTeamStr, [req.body.team, req.body.mbr_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  # 멤버 FCM 토큰 설정
  setFcmToken: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      setStr = "UPDATE eq_member SET mbr_fcm = ?
        WHERE mbr_idx = ?"
      db.query res, setStr, [req.body.mbr_fcm, req.body.mbr_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  # 멤버 삭제
  delete: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      delQr = 'DELETE FROM eq_member WHERE mbr_idx = ?'
      db.query res, delQr, [req.body.mbr_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  # 조 구성 알림
  notifyTeam: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      ntfStr = "SELECT * FROM eq_member"
      db.query res, ntfStr, [], (results, fields) ->
        results.map (mbr) ->
          if mbr.mbr_fcm.length > 0
            teamStr = '조가 배정되지 않았습니다.'
            if mbr.mbr_team > 0
              teamStr = mbr.mbr_team + '조입니다.'
            fcm.sendFCM mbr.mbr_fcm, 'team', '조 구성 변경', teamStr
        res.send result

  # 직원 예상 도착시간 받기
  arrivalReport: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      mbrIdx = req.body.mbr_idx
      arrival = req.body.arrival
      query = 'UPDATE eq_member SET mbr_arrive_in = ?, mbr_arr_last_report = NOW() WHERE mbr_idx = ?'
      params = [arrival, mbrIdx]
      db.query res, query, params, (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  # 직원 예상 도착시간 받기
  locationReport: (req, res) ->
    _this = this
    _this.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      mbrIdx = req.body.mbr_idx
      latitude = req.body.latitude
      longitude = req.body.longitude
      query = 'UPDATE eq_member SET latitude = ?, longitude = ?, mbr_pos_last_report = NOW() WHERE mbr_idx = ?'
      params = [latitude, longitude, mbrIdx]
      db.query res, query, params, (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result
}

module.exports = dbwork