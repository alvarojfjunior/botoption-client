const firebase = require("firebase/app")
require('firebase/auth')

const firebaseConfig = {
    apiKey: "AIzaSyAkI8bnX9tiw-xMQKhMiL5NvhUTEkOBzBQ",
    authDomain: "iqbot-d2343.firebaseapp.com",
    projectId: "iqbot-d2343",
    storageBucket: "iqbot-d2343.appspot.com",
    messagingSenderId: "161582040100",
    appId: "1:161582040100:web:e8779b4b940ff6f81c04b1"
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth(); 

module.exports = {
    auth
}