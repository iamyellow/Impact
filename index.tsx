import React from 'react'
import ReactDOM from 'react-dom'
import { ExampleGame } from './example/ExampleGame'
import './style.css'

if (module.hot) {
  module.hot.accept()
}

ReactDOM.render(<ExampleGame />, document.getElementById('root'))
