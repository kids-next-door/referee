const firebase = require('./config-firebase')

const auth = require('./auth')
const { generateID } = require('./utility')

const equalPoints = (a, b) => a.x === b.x && a.y === b.y

const validateMove = (currentPosition, requestedPosition, path, gridSize) => {
	if (!requestedPosition || !gridSize) {
		return false
	}

	if (requestedPosition.x < 0
		|| requestedPosition.y < 0
		|| requestedPosition.x >= gridSize.width
		|| requestedPosition.y >= gridSize.height) {
		// off edge of grid
		return false
	}

	if (!currentPosition) {
		return true
	}

	// TODO: Reset to start of path
	// for (const tileLocation of path) {
	// 	if (equalPoints(requestedPosition, tileLocation)) {
	// 		// point is on path
	// 		return true
	// 	}
	// }
	return true
	return false
}

const acceptMove = game => (updatedState, playerID) => ({
	...updatedState,
	[playerID]: {
		...game.player_state[playerID],
		current_position: game.player_state[playerID].requested_position,
		requested_position: null,
	},
})

const acceptMoveRequests = () =>
	firebase.database()
	    .ref('games')
	    .on('child_changed', async snapshot => {
				const game = snapshot.val()

				if (!game.player_state) {
					return
				}

				let newState =
					Object.keys(game.player_state)
						.filter(playerID => {
							const state = game.player_state[playerID]
							return validateMove(state.current_position, state.requested_position, game.paths[playerID], game.grid_size)
						})
						.reduce(acceptMove(game), {})

				const winners = Object.keys(newState)
															.reduce((winners, playerID) => {
																const playerState = newState[playerID]
																const path = game.paths[playerID]
																const end = path[path.length - 1]	

																if (equalPoints(playerState.current_position, end)) {
																	return [...winners, playerID]
																}
																return winners
															}, [])

				for (const winner of winners) {
					newState[winner].finished = new Date()
				}

				firebase.database()
						.ref(`games/${snapshot.key}/player_state`)
						.update(newState)
			})

const gameCompleted = () =>
	firebase.database()
	    .ref('games')
	    .on('child_changed', async snapshot => {
            const game = snapshot.val()

						if (game.status !== 'in-progress') {
							return
						}
						const playerCount = Object.keys(game.connected_players).length

						const winnersCount = Object.keys(game.player_state)
																	.reduce((count, playerID) => {
																		const { finished } = game.player_state[playerID]
																		return finished ? count + 1 : count
																	}, 0)

						if (winnersCount === playerCount) {
							firebase.database()
								.ref(`games/${snapshot.key}/status`)
								.set('over')
						}
	    })

module.exports = {
	listeners: [acceptMoveRequests, gameCompleted]
}
