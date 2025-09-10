const html = require('choo/html')

function animal(onclick, animal, i) {
  const { name, x, y } = animal
  return html`<img src="/_static/assets/${name}.gif" style="left: ${x}px; top: ${y}px;" id=${i} onclick=${onclick}>`
}

module.exports = function home(state, emit) {
  const filter = state.params.name
  const animals = ['crocodile', 'koala', 'lion', 'tiger', 'walrus']

  function add(e) {
    const x = e.offsetX - 20
    const y = e.offsetY - 10
    const idx = Math.floor(Math.random() * animals.length)
    const name = filter ? filter : animals[idx]
    emit('addAnimal', { x, y, name })
  }

  function remove(e) {
    const i = e.target.id
    emit('removeAnimal', i)
  }

  function animalMap(obj, i) {
    if (filter && filter !== obj.name) { return }
    return animal(remove, obj, i)
  }

  function attestationDemo() {
    const onclick = (e) => emit('pushState', '/wallet')
    return html`<button onclick=${onclick}>Attestation demo</button>`
  }

  return html`
    <div class="container app">
      <h1 class="header">Hello! v4!! Click to add animal</h1>
      ${attestationDemo()}
      <div class="grass">
        <img src="/_static/assets/bg.gif" onclick=${add} />
        ${state.animals.map(animalMap)}
      </div>
      <div class="controls">
        <ul class="filters">
          <li><a href="/">all</a>,</li>
          <li><a href="/filter/crocodile">crododiles</a>,</li>
          <li><a href="/filter/koala">koalas</a>,</li>
          <li><a href="/filter/lion">lions</a>,</li>
          <li><a href="/filter/tiger">tigers</a>,</li>
          <li><a href="/filter/walrus">walruses</a></li>
        </ul>
      </div>
      <footer>
        <a href="https://github.com/rhodey">@rhodey</a> edit <a href="https://github.com/louiscenter/choo-animals">@louiscenter</a> with <a href="https://github.com/choojs/choo">choo</a>
      </footer>
    </div>
  `
}
