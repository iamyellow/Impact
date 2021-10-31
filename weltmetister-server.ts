import express from 'express'

const app = express()

app.get('/save', (req, res) => {
  console.log('***** save')
  res.send({})
})

app.get('/browse', (req, res) => {
  const { dir, type } = req.query
  res.send({
    parent: false,
    dirs: [],
    files: ['fuck']
  })
})

app.listen(6120)
