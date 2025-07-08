const choo = require('choo')
const LRU = require('nanolru')
const devtools = require('choo-devtools')

function store(state, emitter) {
  state.animals = [
    { name: 'lion', x: 200, y: 100 },
    { name: 'crocodile', x: 50, y: 300 },
  ]

  emitter.on('addAnimal', (obj) => {
    state.animals.push(obj)
    emitter.emit('render')
  })

  emitter.on('removeAnimal', (idx) => {
    state.animals.splice(idx, 1)
    emitter.emit('render')
  })
}

const cache = new LRU(100)
const app = choo({ cache })
app.use(devtools())
app.use(store)

const home = require('./home.js')
app.route('/*', home)
app.route('/filter/:name', home)
app.mount('.app')

// emitted by IPFS-boot
const onUnload = (e) => {
  window.removeEventListener('unload', onUnload)
  app.emitter.removeAllListeners()
  cache.clear()
}
window.addEventListener('unload', onUnload)
