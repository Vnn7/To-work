/*
  publicRoutes.js
  -----------------------------------------------------------------------------
  Rotas públicas são rotas que não exigem login.

  Qualquer pessoa pode acessar:
  - status da API;
  - categorias;
  - prestadores cadastrados.
*/

const express = require('express');
const { buscarTodos } = require('../database');

const router = express.Router();

/*
  GET /api/health
  -----------------------------------------------------------------------------
  Rota simples para testar se a API está funcionando.
*/
router.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'API To Work funcionando.'
  });
});

/*
  GET /api/categories
  -----------------------------------------------------------------------------
  Busca todas as categorias cadastradas no SQLite.

  A Home usa essa rota para montar os cards de categorias populares.
*/
router.get('/categories', async (req, res) => {
  try {
    const categories = await buscarTodos(`
      SELECT
        id,
        name,
        description,
        created_at AS createdAt
      FROM categories
      ORDER BY name ASC
    `);

    return res.json({ categories });
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro.message);
    return res.status(500).json({ message: 'Erro ao listar categorias.' });
  }
});

/*
  GET /api/professionals
  -----------------------------------------------------------------------------
  Lista os prestadores ativos.

  Esta rota junta duas tabelas:
  - users: nome, email e tipo da conta;
  - provider_profiles: dados profissionais.

  O INNER JOIN liga o usuário ao perfil de prestador.
*/
router.get('/professionals', async (req, res) => {
  try {
    const professionals = await buscarTodos(`
      SELECT
        pp.id,
        u.full_name AS fullName,
        u.email,
        pp.description,
        pp.rating,
        pp.reviews_count AS reviewsCount,
        pp.verified
      FROM provider_profiles pp
      INNER JOIN users u ON u.id = pp.user_id
      WHERE u.active = 1
        AND u.account_type = 'PRESTADOR'
      ORDER BY pp.rating DESC, u.full_name ASC
    `);

    return res.json({ professionals });
  } catch (erro) {
    console.error('Erro ao listar prestadores:', erro.message);
    return res.status(500).json({ message: 'Erro ao listar prestadores.' });
  }
});

module.exports = router;
