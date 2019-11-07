const _ = require('lodash')

const firebase = require('./config-firebase')
const auth = require('./auth')
const { generateID } = require('./utility')

const modules = [
    require('./game-creation'),
    require('./move-validator'),
    require('./path-creation'),
]

const listeners = _.flatten(modules.map(m => m.listeners || []))

// start listeners
listeners.forEach(l => l())
