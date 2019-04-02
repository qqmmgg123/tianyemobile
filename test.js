const Immutable = require('seamless-immutable')

const state = Immutable({
  a: []
})

const newState = state.merge({a: [{b: 1}]})

const a = newState.a.merge()
const s = newState.a.find(i => i.b === 1)
s.setIn(['b'], 3, {deep: true})
const nextState = newState.merge({a: newState.a})

console.log(newState.a === nextState.a)
