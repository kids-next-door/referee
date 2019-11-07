const bcrypt = require('bcryptjs')

const firebase = require('./config-firebase')

/*
	registerStateListener
		handler: user => { }
*/

module.exports = {
	createUser: async (email, password) => await firebase.auth().createUserWithEmailAndPassword(email, password),
	login: async (email, password) => await firebase.auth().signInWithEmailAndPassword(email, password),
	loginAnonymously: firebase.auth().signInAnonymously(),
	logout: async () => await firebase.auth().signOut(),

	registerStateListener: async handler => firebase.auth().onAuthStateChanged(handler),

	generateHash: () => bcrypt.genSaltSync(10),
	hashPassword: (password, salt) => bcrypt.hashSync(password, salt),
}
