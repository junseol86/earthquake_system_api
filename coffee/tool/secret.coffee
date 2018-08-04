secret = {
  connectionInfo : {
    connectionLimit: 10,
    host: '35.229.252.63',
    user: 'kyeongju_doro',
    password: 'KimChang0!',
    database: 'eq_system'
  },
  jwtSecret: 'pohangjeilchurch',
  dataKrKey: 'HkXSYQWVC%2BZyZoQsd4%2BC4zA0HiWcN5G%2FLEazZ4IUp90JY2ozrL8TXcvIQaEfgASX%2Bwu%2Bx2%2FEPXt%2F5m5YThfWeQ%3D%3D',
  sampleResponse: '
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <response>
     <header>
       <resultCode>0000</resultCode>
       <resultMsg>OK</resultMsg>
     </header>
     <body>
       <items>
        <item>
          <cnt>1</cnt>
          <fcTp>3</fcTp>
          <img>http://www.weather.go.kr/repositary/image/eqk/img/eqk_img_fcTp_20171126031345.png</img>
          <inT>최대진도Ⅰ</inT>
          <lat>36.47</lat>
          <loc>충남 태안군 서격렬비도 서남서쪽 64km 해역</loc>
          <lon>124.83</lon>
          <mt>2.9</mt>
          <rem>지진피해 없을 것으로 예상됨</rem>
          <stnId>108</stnId>
          <tmEqk>20171126031345</tmEqk>
          <tmFc>201711260317</tmFc>
          <tmSeq>109</tmSeq>
         </item>
       </items>
       <numOfRows>10</numOfRows>
       <pageNo>1</pageNo>
       <totalCount>1</totalCount>
    </body>
  </response>
  ',
  sampleResponse2: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <response>
        <header>
            <resultCode>0000</resultCode>
            <resultMsg>OK</resultMsg>
        </header>
        <body>
            <items>
                <item>
                    <cnt>1</cnt>
                    <dep>23</dep>
                    <fcTp>3</fcTp>
                    <img>http://www.weather.go.kr/repositary/image/eqk/img/eqk_img_3_20180719055211.png</img>
                    <inT>최대진도 Ⅰ</inT>
                    <lat>35.83</lat>
                    <loc>경북 포항시 남구 동남동쪽 44km 해역</loc>
                    <lon>129.8</lon>
                    <mt>2.5</mt>
                    <rem>지진피해 없을 것으로 예상됨</rem>
                    <stnId>108</stnId>
                    <tmEqk>20180719055211</tmEqk>
                    <tmFc>201807190554</tmFc>
                    <tmSeq>916</tmSeq>
                </item>
                <item>
                    <cnt>1</cnt>
                    <fcTp>3</fcTp>
                    <img>http://www.weather.go.kr/repositary/image/eqk/img/eqk_img_3_20180717201912.png</img>
                    <inT>최대진도 Ⅳ(경남,전북),Ⅲ(경북,충북),Ⅱ(충남)</inT>
                    <lat>35.91</lat>
                    <loc>전북 무주군 남동쪽 17km 지역</loc>
                    <lon>127.81</lon>
                    <mt>2.7</mt>
                    <rem>지진피해 없을 것으로 예상됨</rem>
                    <stnId>108</stnId>
                    <tmEqk>20180717201912</tmEqk>
                    <tmFc>201807172022</tmFc>
                    <tmSeq>889</tmSeq>
                </item>
            </items>
            <numOfRows>10</numOfRows>
            <pageNo>1</pageNo>
            <totalCount>2</totalCount>
        </body>
    </response>'
}

module.exports = secret