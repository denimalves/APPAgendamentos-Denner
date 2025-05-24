import express from 'express'
import cors from 'cors'
import {
  createTable,
  inseriragenda,
  atualizaragenda,
  selecionaragenda,
  excluiragenda,
  //getById,
} from './controler/agenda.js'

const app = express()

const corsOptions = {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

createTable()

app.get('/', (req, res) => {
  res.send('Bem-vindo à API de Agendamentos')
})

app.get('/agendamentos', async (req, res) => {
  const dados = await selecionaragenda()
  res.json(dados)
})

// app.get('/agendamentos/:id', async (req, res) => {
//   const dados = await getById()
//   res.json(dados)
// })

app.post('/agendamentos', async (req, res) => {
  await inseriragenda(req.body)
  res.status(201).json({ message: 'Criado com sucesso' })
})

app.put('/agendamentos', async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ message: 'ID obrigatório' })
  }
  await atualizaragenda(req.body)
  res.json({ message: 'Atualizado com sucesso' })
})

app.delete('/agendamentos/:id', async (req, res) => {
  const { id } = req.params
  await excluiragenda(id)
  res.json({ message: 'Removido com sucesso' })
})

app.listen(3000, () => console.log('API rodando em http://localhost:3000'))
