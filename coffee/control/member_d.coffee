db = require '../tool/mysql'
util = require '../tool/util'

dbwork = {

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
    _this.checkIdExists req, res, (results, fields) ->
      if results[0].count > 0
        res.status(403).send {
          result: '중복되는 아이디가 있습니다.'
        }
      else
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
    _this.findMemberById req, res, (results, fields) ->
      if results.length == 0
        res.status(403).send {
          result: '존재하지 않는 아이디입니다.'
        }
      else
        if util.hashMD5(req.body['password'] + results[0].mbr_salt) != results[0].mbr_hash
          res.status(403).send {
            result: '비밀번호를 확인해주세요.'
          }
        else
          res.send {
            result: 'SUCCESS'
          }

        


}

module.exports = dbwork