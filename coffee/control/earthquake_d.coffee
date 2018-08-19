db = require '../tool/mysql'
member = require './member_d'
util = require './../tool/util'
fcm = require './../tool/fcm'
request = require 'request'
secret = require './../tool/secret'
parseXml = require('xml2js').parseString

dbwork = {

  # 지진 리스트 다운
  getList: (req, res) ->
    db.query res, 'SELECT * FROM eq_earthquake ORDER BY eq_idx DESC', [], (results, fields) ->
      results.map (eq) ->
        util.evalEq eq
      res.send results

  # 지진 하나 다운
  getOneByIdx: (req, res, eq_idx, func) ->
    db.query res, 'SELECT * FROM eq_earthquake WHERE eq_idx = ?', [eq_idx], (results, fields) ->
      func results[0]

  # 지진 입력
  insert: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      insQr = 'INSERT INTO eq_earthquake
        (eq_type, eq_strength, latitude, longitude)
        VALUES (?, ?, ?, ?)'
      db.query res, insQr, [req.body.type, req.body.strength, req.body.lat, req.body.lng], (results, fields) ->
        result.success = results.affectedRows > 0
        if !result.success
          res.send result
        else
          _this.getOneByIdx req, res, results.insertId, (earthquake) ->
            result.eq_earthquake = earthquake
            res.send result

  # 지진 삭제 
  delete: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      delQr = 'DELETE FROM eq_earthquake WHERE eq_idx = ?'
      db.query res, delQr, [req.body.eq_idx], (results, fields) ->
        result.success = results.affectedRows > 0
        res.send result

  #지진 진행/종료
  activeToggle: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      allOffQr = 'UPDATE eq_earthquake SET eq_active = 0'
      db.query res, allOffQr, [], (results, fields) ->
        result.success = results.affectedRows > 0
        if req.body.set == '0'
          res.send result
        else 
          actvQr = 'UPDATE eq_earthquake SET eq_active = 1 WHERE eq_idx = ?'
          db.query res, actvQr, [req.body.eq_idx], (results, fields) ->
            result.success = results.affectedRows > 0
            res.send result

  #지진 알림 보내기
  sendEqNotification: (req, res) ->
    _this = this
    member.tokenCheck req, res, (jwtToken) ->
      result = {
        jwtToken: jwtToken
      }
      level = if req.body.level == 0 then '자체대응' else if req.body.level == 1 then '대응 1단계' else '대응 2단계'
      type = if req.body.type == 'inland' then '내륙' else '해역'
      ntfStr = "SELECT * FROM eq_member"
      db.query res, ntfStr, [], (results, fields) ->
        results.map (mbr) ->
          if mbr.mbr_fcm.length > 0
            fcm.sendFCM mbr.mbr_fcm, 'earthquake', "지진발생 [#{level}]", "#{type} #{req.body.strength}"
        res.send result

  # 지진체킹 돌고 있는지 확인하는 지표
  checkEqCount: 0
  checkEqStr: ''
      
  # 새 지진 여부 체크
  checkEq: () ->
    _this = this
    _this.checkEqCount = (_this.checkEqCount + 1) % 100
    today = new Date()
    _3DaysAgo = new Date()
    _3DaysAgo.setDate(today.getDate() - 3)
    today.setDate(today.getDate() + 1)
    eqFrom = "#{_3DaysAgo.getFullYear()}#{if _3DaysAgo.getMonth() > 8 then '' else '0'}#{_3DaysAgo.getMonth() + 1}#{if _3DaysAgo.getDate() > 9 then '' else '0'}#{_3DaysAgo.getDate()}"
    eqTo = "#{today.getFullYear()}#{if today.getMonth() > 8 then '' else '0'}#{today.getMonth() + 1}#{if today.getDate() > 9 then '' else '0'}#{today.getDate()}"
    url = "http://newsky2.kma.go.kr/service/ErthqkInfoService/EarthquakeReport?
      serviceKey=#{secret.dataKrKey}
      &numOfRows=#{10}
      &pageSize=#{10}
      &pageNo=#{1}
      &startPage=#{1}
      &fromTmFc=#{eqFrom}
      &toTmFc=#{eqTo}"
      .replace(/\s/g,'')
    # console.log url
    request {
      url: url,
      method: 'GET'
    }, (error, response, body) -> 

      bodyStr = body
      _this.checkEqStr = "#{_this.checkEqCount} | #{eqFrom} ~ #{eqTo} | #{bodyStr}"
      # bodyStr = secret.sampleResponse2

      parseXml bodyStr, (error, result) ->
        data = result.response.body[0]
        # console.log data
        totalCount = Number(data.totalCount[0])

        if totalCount == 0
          return
        # 3일 내 발생한 지진이 있다면

        item = data.items[0].item[0]
        # console.log item
        eqObj = {
          eq_tm_fc: item.tmFc[0]
          eq_type: if item.loc[0].includes('해역') then 'waters' else 'inland'
          eq_strength: item.mt[0]
          latitude: item.lat[0]
          longitude: item.lon[0]
        }

        _this.checkEqStr += " | #{JSON.stringify(eqObj)}"

        latitudeNum = Number(eqObj.latitude)
        longitudeNum = Number(eqObj.longitude)

        if !(38.47722 > latitudeNum > 33.6586) || !(130.9597 > longitudeNum > 123.1278)
          return

        #  대처해야 하는 강도의 지진 여부
        weak = false
        if eqObj.eq_strength < 3.5 || (eqObj.eq_type == 'waters' && eqObj.eq_strength < 4)
          weak = true

        # 테이블에 저장된 지진인지 확인
        qrStr = "SELECT COUNT(*) as count FROM #{if weak then 'eq_earthquake_weak' else 'eq_earthquake'} WHERE eq_tm_fc = ?"
        db.query null, qrStr, [eqObj.eq_tm_fc], (results, fields) ->
          found = results[0].count

          if found > 0 
            return
          # 새로운 지진이라면 테이블에 저장

          udtStr = "UPDATE eq_earthquake SET eq_active = 0 #{if weak then 'WHERE eq_idx = -1' else ''}"
          db.query null, udtStr, [], (results, params) ->

            insStr = "INSERT INTO #{if weak then 'eq_earthquake_weak' else 'eq_earthquake'}
              (eq_active, eq_type, eq_strength, latitude, longitude, eq_tm_fc)
              VALUES (1, ?, ?, ?, ?, ?)"
            insPrms = [eqObj.eq_type, eqObj.eq_strength, eqObj.latitude, eqObj.longitude, eqObj.eq_tm_fc]
            db.query null, insStr, insPrms, (results, fields) ->
              insSuccess = results.affectedRows > 0

              if !insSuccess
                return
              # 저장에 성공했다면

              if weak
                return
              # 그리고 대처해야 하는 강도의 지진이라면 신호 보냄

              level = ''
              type = ''
              if eqObj.eq_type == 'inland'
                type = '내륙'
                if 3.5 <= eqObj.eq_strength < 4
                  level = '자체대응'
                if 4 <= eqObj.eq_strength < 5
                  level = '대응 1단계'
                if eqObj.eq_strength >= 5
                  level = '대응 2단계'

              if eqObj.eq_type == 'waters'
                type = '해역'
                if 4 <= eqObj.eq_strength < 4.5
                  level = '자체대응'
                if 4.5 <= eqObj.eq_strength < 5.5
                  level = '대응 1단계'
                if eqObj.eq_strength >= 5.5
                  level = '대응 2단계'

              ntfStr = "SELECT * FROM eq_member"
              db.query null, ntfStr, [], (results, fields) ->
                results.map (mbr) ->
                  if mbr.mbr_fcm.length > 0
                    fcm.sendFCM mbr.mbr_fcm, 'earthquake', "지진발생 [#{level}]", "#{type} #{eqObj.eq_strength}"

}
    
module.exports = dbwork