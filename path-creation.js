const firebase = require('./config-firebase')

const { generatePath } = require('./path')

const autoAssignPaths = () =>
	firebase.database()
    .ref('games')
    .on('child_changed', async snapshot => {
			const game = snapshot.val()

      if (game.status !== 'ready') {
        return
      }

			const paths = Object.keys(game.connected_players)
													.reduce((paths, playerID) => ({
														...paths,
														[playerID]: generatePath(9, game.grid_size),
													}), {})

			const state = Object.keys(paths)
													.reduce((state, playerID) => ({
														...state,
														[playerID]: {
															current_position: paths[playerID][0],
														}
													}), {})

			const scores = game.scores || Object.keys(game.connected_players)
														.reduce((scores, playerID) => ({
															...scores,
															[playerID]: 0,
														}), {})
					
      firebase.database()
        .ref(`games/${snapshot.key}`)
        .update({ paths, player_state: state, status: 'in-progress', started: new Date(), scores })
    })

module.exports = {
	listeners: [autoAssignPaths]
}
