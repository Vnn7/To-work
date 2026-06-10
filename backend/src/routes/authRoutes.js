const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../database');
const generateToken = require('../utils/generateToken');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function formatUser(user) {
  return {
    id: user.id,
    fullName: user.full_name || user.fullName,
    email: user.email,
    accountType: user.account_type || user.accountType,
    createdAt: user.created_at || user.createdAt
  };
}

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, accountType } = req.body;

    const cleanFullName = String(fullName || '').trim();
    const cleanEmail = normalizeEmail(email);
    const cleanAccountType = String(accountType || '').trim().toUpperCase();

    if (!cleanFullName || !cleanEmail || !password || !cleanAccountType) {
      return res.status(400).json({
        message: 'Preencha nome completo, email, senha e tipo da conta.'
      });
    }

    if (!['CLIENTE', 'PRESTADOR'].includes(cleanAccountType)) {
      return res.status(400).json({
        message: 'Tipo de conta inválido. Use CLIENTE ou PRESTADOR.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: 'A senha precisa ter pelo menos 6 caracteres.'
      });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [cleanEmail]);

    if (existingUser) {
      return res.status(409).json({ message: 'Já existe uma conta com esse email.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const result = await run(
      `
        INSERT INTO users (full_name, email, password_hash, account_type)
        VALUES (?, ?, ?, ?)
      `,
      [cleanFullName, cleanEmail, passwordHash, cleanAccountType]
    );

    if (cleanAccountType === 'PRESTADOR') {
      await run(
        `
          INSERT INTO provider_profiles (user_id, description)
          VALUES (?, ?)
        `,
        [result.id, 'Novo prestador cadastrado na plataforma.']
      );
    }

    const user = await get('SELECT id, full_name, email, account_type, created_at FROM users WHERE id = ?', [result.id]);
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Conta criada com sucesso.',
      user: formatUser(user),
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao criar conta.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Informe email e senha.' });
    }

    const user = await get(
      `
        SELECT id, full_name, email, password_hash, account_type, active, created_at
        FROM users
        WHERE email = ?
      `,
      [cleanEmail]
    );

    if (!user || user.active !== 1) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login realizado com sucesso.',
      user: formatUser(user),
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
