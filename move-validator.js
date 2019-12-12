const firebase = require('./config-firebase')

const auth = require('./auth')
const { generateID } = require('./utility')

const equalPoints = (a, b) => a.x === b.x && a.y === b.y

const validateMove = (currentPosition, requestedPosition, path, gridSize) => {
	if (requestedPosition.x < 0
		|| requestedPosition.y < 0
		|| requestedPosition.x >= gridSize.width
		|| requestedPosition.y >= gridSize.height) {
		// off edge of grid
		return null
	}

	if (!currentPosition) {
		return null
	}

	for (const step of path.keys()) {
		const tileLocation = path[step]

		if (equalPoints(currentPosition, tileLocation)) {
			const nextStep = path[step + 1]
			return equalPoints(requestedPosition, nextStep)
		}
	}
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

const rejectMove = game => (updatedState, playerID) => ({
	...updatedState,
	[playerID]: {
		...game.player_state[playerID],
		current_position: game.paths[playerID][0],
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

				const decisions =
					Object.keys(game.player_state)
						.filter(playerID => game.player_state[playerID].requested_position)
						.map(playerID => {
							const state = game.player_state[playerID]
							const decision = validateMove(state.current_position, state.requested_position, game.paths[playerID], game.grid_size)
							
							let code
							switch (decision) {
								case true:
									code = 'accept'
									break
								case false:
									code = 'reset'
									break
								default:
									code = 'ignore'
									break
							}
							return { playerID, decision: code }
						})

				

				let newState =
					decisions
						.filter(d => d.decision === 'accept')
						.map(d => d.playerID)
						.reduce(acceptMove(game), {})

				newState =
					decisions
						.filter(d => d.decision === 'reset')
						.map(d => d.playerID)
						.reduce(rejectMove(game), newState)

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
							let finishTimes = Object.keys(game.player_state)
																		.map(playerID => {
																			const { finished } = game.player_state[playerID]
																			return { playerID, finished }
																		})

							finishTimes.sort((a, b) => (a.finished < b.finished) ? -1 : 1)

							let { scores } = game

							const rewards = [100, 80, 50]
							rewards.forEach((reward, rank) => {
								const player = finishTimes[rank]
								if (!player) {
									return
								}
								scores[player.playerID] += reward
							})

							firebase.database()
											.ref(`games/${snapshot.key}`)
											.update({
												scores,
												status: 'over',
											})
						}
	    })

module.exports = {
	listeners: [acceptMoveRequests, gameCompleted],
	functions: {
		validateMove,
	}
}
