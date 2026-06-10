const express = require('express');
const { all } = require('../database');

const router = express.Router();

router.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'API To Work funcionando.'
  });
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await all(
      `
        SELECT id, name, description, created_at AS createdAt
        FROM categories
        ORDER BY name ASC
      `
    );

    return res.json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar categorias.' });
  }
});

router.get('/professionals', async (req, res) => {
  try {
    const professionals = await all(
      `
        SELECT
          pp.id,
          u.full_name AS fullName,
          u.email,
          pp.phone,
          pp.city,
          pp.state,
          pp.description,
          pp.base_price AS basePrice,
          pp.rating,
          pp.reviews_count AS reviewsCount,
          pp.verified
        FROM provider_profiles pp
        INNER JOIN users u ON u.id = pp.user_id
        WHERE u.active = 1 AND u.account_type = 'PRESTADOR'
        ORDER BY pp.rating DESC, u.full_name ASC
      `
    );

    return res.json({ professionals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar prestadores.' });
  }
});

module.exports = router;
