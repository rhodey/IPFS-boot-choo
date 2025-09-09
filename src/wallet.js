const html = require('choo/html')

const ZEROS = new Array(96).fill('0').join('')
const DEV_PCR = [ZEROS, ZEROS, ZEROS]

const PROD_PCR = [
  '961d650a03f4af416c1934d0d1370264611aaed68cd9bdc79e62455386b400f3e4cafc2cd2c98409996d678625380ff9',
  '4b4d5b3661b3efc12920900c80e126e4ce783c522de6c02a2a5bf7af3a2b9327b86776f188e4be1c1c404a129dbda493',
  '86178225d7160bb9d3a5c046cb14f60d4719bf07a8833a46d1a7a635f7ab3b0f7d016732f19ab9d43f7616e3e82b2011',
]

const PROD_TARGET = 'https://demo.lock.host/api'
const PROD_PATTERN = `^https:\/\/demo.lock.host\/api\/.*`

const DEV_TARGET = 'https://localhost:8888/api'
const DEV_PATTERN = `^https:\/\/localhost:8888\/api\/.*`

module.exports = function wallet(state, emit) {
  const radioOption = (id) => {
    const PCR = id === 'prod' ? PROD_PCR : DEV_PCR
    const target = id === 'prod' ? PROD_TARGET : DEV_TARGET
    const pattern = id === 'prod' ? PROD_PATTERN : DEV_PATTERN
    const config = [id, target, pattern, PCR]
    const onclick = (e) => emit('attestConfig', config)
    const checked = state.attestConfig[0] === id ? 'checked' : ''
    return html`<input type="radio" onclick=${onclick} ${checked}>`
  }

  const queryEnclaveWallet = () => {
    const onclick = (e) => emit('queryEnclaveWallet')
    return html`<button onclick=${onclick}>query</button>`
  }

  const createUserWallet = () => {
    const onclick = (e) => emit('createUserWallet')
    return html`<button onclick=${onclick}>create</button>`
  }

  const askForFundsMsg = (e) => emit('askForFundsMsg', e.target.value)

  const askForFunds = () => {
    const onclick = (e) => emit('askForFunds')
    return html`<button onclick=${onclick}>ask</button>`
  }

  const enclaveAddr = state.enclaveWallet ? state.enclaveWallet.addr : ''
  const enclaveQty = state.enclaveWallet ? state.enclaveWallet.balance : ''

  const userAddr = state.userWallet ? state.userWallet.publicKey.toBase58() : ''
  const userQty = state.userWallet?.balance ? state.userWallet.balance : ''

  let statee = 'ready'
  if (state.attestError) {
    statee = `service worker error: ${state.attestError}`
  } else if (!state.attestReady) {
    statee = `waiting on service worker connect`
  } else if (!state.attestConfigReady) {
    statee = `waiting on target select`
  } else if (!state.enclaveWallet) {
    statee = `waiting on query enclave wallet`
  } else if (!state.userWallet) {
    statee = `waiting on create user wallet`
  } else if (state.fetchError) {
    statee = `fetch error: ${state.fetchError}`
  }

  return html`
    <div class="container app">
      <h1 class="header">Attestation Demo</h1>
      <h1 class="header">State = ${statee}</h1>

      <div class="enclaveProdPCR">
        <h1 class="header">Prod PCR</h1>
        PCR0: <input type="text" value="${PROD_PCR[0]}" size="25" readonly><br/>
        PCR1: <input type="text" value="${PROD_PCR[1]}" size="25" readonly><br/>
        PCR2: <input type="text" value="${PROD_PCR[2]}" size="25" readonly><br/>
      </div>

      <div class="enclaveDevPCR">
        <h1 class="header">Dev PCR</h1>
        PCR0: <input type="text" value="${DEV_PCR[0]}" size="25" readonly><br/>
        PCR1: <input type="text" value="${DEV_PCR[1]}" size="25" readonly><br/>
        PCR2: <input type="text" value="${DEV_PCR[2]}" size="25" readonly><br/>
      </div>

      <div class="enclaveTarget">
        <h1 class="header">Target</h1>
        ${radioOption('prod')} PROD: <input type="text" value="${PROD_TARGET}" size="25" readonly><br/>
        ${radioOption('dev')} DEVV: <input type="text" value="${DEV_TARGET}" size="25" readonly><br/>
      </div>

      <div class="enclaveWallet">
        <h1 class="header">Enclave wallet</h1>
        ADDR: ${queryEnclaveWallet()} <input type="text" value="${enclaveAddr}" size="45" readonly> QTY: <input type="text" value="${enclaveQty}" size="6" readonly><br/>
      </div>

      <div class="userWallet">
        <h1 class="header">User wallet</h1>
        ADDR: ${createUserWallet()} <input type="text" value="${userAddr}" size="45" readonly> QTY: <input type="text" value="${userQty}" size="6" readonly><br/>
      </div>

      <div class="askForFunds">
        <h1 class="header">Ask for funds</h1>
        Enter a polite message to receive crypto<br/>
        Enter a rude message to receive nothing<br/>
        (small delay waiting for the network to confirm txn)<br/>
        <br/>
        MSG: ${askForFunds()} <input type="text" oninput=${askForFundsMsg} value="${state.askForFunds}" size="60"><br/>
        ACK: <input type="text" value="${state.askForFundsAck}" size="45" readonly><br/>
      </div>
    </div>
  `
}
