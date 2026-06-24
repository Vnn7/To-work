/*
  app.js
  -----------------------------------------------------------------------------
  Este arquivo monta a API com Express.

  Pense nele como a "recepção" do back-end:
  1. recebe as requisições;
  2. libera o acesso do front-end com CORS;
  3. ensina o Express a ler JSON;
  4. encaminha cada rota para o arquivo correto.
*/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');

// Aqui nasce a aplicação Express.
// A variável "app" representa a API inteira.
const app = express();

/*
  CORS
  -----------------------------------------------------------------------------
  O front-end roda em uma porta, normalmente http://localhost:5173.
  O back-end roda em outra porta, normalmente http://localhost:3001.

  Como são origens diferentes, o navegador bloqueia a comunicação se a API não
  permitir. O cors() libera o front-end configurado no .env.
*/
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

/*
  express.json()
  -----------------------------------------------------------------------------
  Permite que o back-end leia dados JSON enviados pelo front-end.

  Exemplo de JSON enviado no login:
  {
    "email": "teste@email.com",
    "password": "123456"
  }

  Sem essa linha, o req.body ficaria vazio ou indefinido.
*/
app.use(express.json());

/*
  Rotas públicas
  -----------------------------------------------------------------------------
  São rotas que qualquer visitante pode acessar, sem login.

  publicRoutes possui:
  GET /health
  GET /categories
  GET /professionals

  Como aqui usamos app.use('/api', publicRoutes), as rotas finais ficam:
  GET /api/health
  GET /api/categories
  GET /api/professionals
*/
app.use('/api', publicRoutes);

/*
  Rotas de autenticação
  -----------------------------------------------------------------------------
  São rotas ligadas a cadastro, login e usuário logado.

  authRoutes possui:
  POST /register
  POST /login
  GET /me

  Como aqui usamos app.use('/api/auth', authRoutes), as rotas finais ficam:
  POST /api/auth/register
  POST /api/auth/login
  GET /api/auth/me
*/
app.use('/api/auth', authRoutes);

/*
  Rota não encontrada
  -----------------------------------------------------------------------------
  Se a requisição chegou até aqui, significa que nenhuma rota acima respondeu.
  Então devolvemos erro 404.
*/
app.use((req, res) => {
  return res.status(404).json({ message: 'Rota não encontrada.' });
});

module.exports = app;
