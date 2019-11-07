const firebase = require('firebase/app')

const database = require('firebase/database')
const auth = require('firebase/auth')

module.exports = firebase.initializeApp({
  apiKey: "AIzaSyBEDXVj7vyKBPcFY0pdtViH0s7wL5geFvM",
  authDomain: "kids-next-door-96484.firebaseapp.com",
  databaseURL: "https://kids-next-door-96484.firebaseio.com",
  projectId: "kids-next-door-96484",
  storageBucket: "kids-next-door-96484.appspot.com",
  messagingSenderId: "980846848739",
  appId: "1:980846848739:web:574a205a0d4436f4"
})
