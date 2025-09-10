const choo = require('choo')
const LRU = require('nanolru')
const devtools = require('choo-devtools')
const { Keypair } = require('@solana/web3.js')

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

  state.attestReady = false
  state.attestConfig = []
  state.attestConfigReady = false

  // user select target = prod or dev
  emitter.on('attestConfig', (config) => {
    if (!state.attestReady) { return emitter.emit('render') }
    state.fetchError = null
    state.attestConfig = config
    const [id, target, pattern, PCR] = config
    const patterns = [{ PCR, pattern }]
    state.attestConfigReady = false
    state.sw.postMessage({ type: 'config', patterns })
    emitter.emit('render')
  })

  const fetchOrError = (url) => {
    return fetch(url).then((res) => {
      if (res.ok) { return res.json() }
      return res.text().then((txt) => Promise.reject(new Error(res.status + ' - ' + txt)))
    })
  }

  // query enclave wallet
  state.fetchError = null
  state.enclaveWallet = null
  emitter.on('queryEnclaveWallet', () => {
    if (!state.attestConfigReady) { return }
    state.fetchError = null
    const target = state.attestConfig[1] + '/wallet'
    fetchOrError(target).then((json) => {
      state.enclaveWallet = json
      emitter.emit('render')
    }).catch((err) => {
      state.fetchError = err.message
      emitter.emit('render')
    })
  })

  // create user wallet
  state.userWallet = null
  emitter.on('createUserWallet', (config) => {
    if (!state.attestConfigReady) { return }
    state.userWallet = Keypair.generate()
    state.userWallet.balance = '0.00000'
    emitter.emit('render')
  })

  // query user wallet
  emitter.on('queryUserWallet', () => {
    if (!state.attestConfigReady) { return }
    if (!state.userWallet) { return }
    state.fetchError = null
    const addr = state.userWallet.publicKey.toBase58()
    const target = state.attestConfig[1] + `/wallet?addr=${addr}`
    fetchOrError(target).then((json) => {
      state.userWallet.balance = json.balance
      emitter.emit('render')
    }).catch((err) => {
      state.fetchError = err.message
      emitter.emit('render')
    })
  })

  // edit ask
  state.askForFunds = 'why did the worker quit his job at the recycling factory? because it was soda pressing'
  emitter.on('askForFundsMsg', (msg) => {
    state.askForFunds = msg
    emitter.emit('render')
  })

  // ask enclave to send crypto
  state.askForFundsAck = ''
  emitter.on('askForFunds', () => {
    if (!state.attestConfigReady) { return }
    if (!state.userWallet) { return }
    state.fetchError = null
    const addr = state.userWallet.publicKey.toBase58()
    const params = new URLSearchParams({ message: state.askForFunds, addr })
    const target = state.attestConfig[1] + `/ask?${params.toString()}`
    fetchOrError(target).then((json) => {
      state.askForFundsAck = JSON.stringify(json)
      emitter.emit('queryEnclaveWallet')
      emitter.emit('queryUserWallet')
    }).catch((err) => {
      state.fetchError = err.message
      emitter.emit('render')
    })
  })

  // message from sw
  emitter.on('sw', (event) => {
    if (event.type === 'attestReady') {
      state.attestReady = true
    } else if (event.type === 'config') {
      state.attestConfigReady = true
    } else if (event.type === 'attestError') {
      state.attestError = event.error
    }
    emitter.emit('render')
  })

  // setup sw
  emitter.on('DOMContentLoaded', () => {
    if (!('serviceWorker' in navigator)) { return }
    const sw = new MessageChannel()
    sw.port1.onmessage = (event) => emitter.emit('sw', event.data)
    state.sw = sw.port1
    const connect = () => navigator.serviceWorker.controller.postMessage({ type: 'connect' }, [sw.port2])
    if (navigator.serviceWorker.controller) { return connect() }
    navigator.serviceWorker.addEventListener('controllerchange', connect)
  })
}

const cache = new LRU(100)
const app = choo({ cache })
app.use(devtools())
app.use(store)

const home = require('./home.js')
app.route('/*', home)
app.route('/filter/:name', home)
const wallet = require('./wallet.js')
app.route('/wallet', wallet)
app.mount('.app')

// emitted by IPFS-boot
const onUnload = (e) => {
  window.removeEventListener('unload', onUnload)
  app.emitter.removeAllListeners()
  cache.clear()
}
window.addEventListener('unload', onUnload)
