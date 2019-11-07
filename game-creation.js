const firebase = require('./config-firebase')

const auth = require('./auth')
const { generateID } = require('./utility')

const requestNewGame = () =>
    firebase.database()
      .ref('games')
      .push({ code: false })
      .key

const isGameCodeUnique = async code => {
  const existing = await firebase.database()
                                  .ref('games')
                                  .orderByChild('code')
                                  .equalTo(code)
                                  .once('value')
  return existing.numChildren() === 0
}

const generateUniqueGameCode = async length => {
  while (true) {
    const code = generateID(length)

    if (await isGameCodeUnique(code)) {
      return code
    }
  }
}

const autoAssignGameCodes = () =>
	firebase.database()
    .ref('games')
    .orderByChild('code')
    .equalTo(false)
    .on('child_added', async snapshot => {
      if (snapshot.val().code) {
          return
      }

      firebase.database()
        .ref(`games/${snapshot.key}`)
        .update({ code: await generateUniqueGameCode(4), status: 'lobby' })
    })

module.exports = {
	listeners: [autoAssignGameCodes]
}
