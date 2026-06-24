/*
  api.js
  -----------------------------------------------------------------------------
  Este arquivo centraliza o endereço da API.

  Em vez de escrever "http://localhost:3001/api" em várias telas,
  criamos uma instância do Axios e reutilizamos no projeto inteiro.
*/

import axios from 'axios';

const api = axios.create({
  // VITE_API_URL vem do arquivo .env do front-end.
  // Se não existir, usa o endereço padrão do back-end local.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});

export default api;
