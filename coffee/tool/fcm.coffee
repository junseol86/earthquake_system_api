admin = require 'firebase-admin'

serviceAccount = require './../../earthquakesystem-8556e-firebase-adminsdk-f10a0-2e0bf1fbfe.json'

admin.initializeApp {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earthquakesystem-8556e.firebaseio.com"
}

fcm = {
  sendFCM: (token, type, title, body) ->
    admin.messaging().send({
      data: {
        type: type,
        title: title,
        body: body
      },
      token: token
    }).then((response) ->
      console.log(response)).catch (error) ->
        console.log(error)
}

module.exports = fcm
