db = require '../tool/mysql'

dbwork = {

  # 멤버 인덱스 존재 여부 확인
  checkMemberIdxExists: (req, res, idx, func) ->
    db.query 'SELECT COUNT(*) FROM member WHERE mbr_idx = ?', [idx], (results, fields) ->
      console.log idx
      console.log results
      console.log fields
      func()
      res.send results

  # 멤버 아이디 존재 여부 확인
  checkIdExists: (req, res, email, func) ->
  
}

module.exports = dbwork