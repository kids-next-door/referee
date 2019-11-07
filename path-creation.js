const firebase = require('./config-firebase')

const generatePath = gridSize => {
	return [...Array(gridSize.height).keys()].map(i => ({ x: 0, y: i }))
}

// module.exports = generatePath

const needsPaths = gameID => {

}

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
												[playerID]: generatePath(game.grid_size),
											}), {})

			const state = Object.keys(paths)
													.reduce((state, playerID) => ({
														...state,
														[playerID]: {
															current_position: paths[playerID][0],
														}
													}), {})
		
      firebase.database()
        .ref(`games/${snapshot.key}`)
        .update({ paths, player_state: state, status: 'in-progress', started: new Date() })
    })

module.exports = {
	listeners: [autoAssignPaths]
}
