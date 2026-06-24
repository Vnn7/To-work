/*
  authRoutes.js
  -----------------------------------------------------------------------------
  Este arquivo cuida das rotas de autenticação:

  POST /api/auth/register -> cadastro
  POST /api/auth/login    -> login
  GET  /api/auth/me       -> retorna o usuário logado
*/

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executar, buscarUm } = require('../database');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/*
  limparEmail()
  -----------------------------------------------------------------------------
  Padroniza o email antes de salvar ou procurar no banco.

  Exemplo:
  "  TESTE@EMAIL.COM " vira "teste@email.com".
*/
function limparEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/*
  montarUsuarioParaResposta()
  -----------------------------------------------------------------------------
  O banco usa snake_case: full_name, account_type, created_at.
  O front-end usa camelCase: fullName, accountType, createdAt.

  Esta função também evita enviar password_hash para o navegador.
*/
function montarUsuarioParaResposta(usuario) {
  return {
    id: usuario.id,
    fullName: usuario.full_name || usuario.fullName,
    email: usuario.email,
    accountType: usuario.account_type || usuario.accountType,
    createdAt: usuario.created_at || usuario.createdAt
  };
}

function pegarSegredoJWT() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no arquivo .env');
  }

  return process.env.JWT_SECRET;
}

/*
  criarToken()
  -----------------------------------------------------------------------------
  Gera o crachá digital do usuário.

  O token guarda apenas o ID do usuário.
  Depois, nas rotas protegidas, usamos esse ID para buscar o usuário no banco.
*/
function criarToken(usuario) {
  return jwt.sign(
    { id: usuario.id },
    pegarSegredoJWT(),
    { expiresIn: '7d' }
  );
}

/*
  POST /api/auth/register
  -----------------------------------------------------------------------------
  Fluxo do cadastro:
  1. recebe nome, email, senha e tipo da conta;
  2. valida os campos;
  3. verifica se o email já existe;
  4. criptografa a senha;
  5. salva o usuário no banco;
  6. se for PRESTADOR, cria perfil inicial;
  7. gera JWT;
  8. devolve usuário + token para o front-end.
*/
router.post('/register', async (req, res) => {
  try {
    const nome = String(req.body.fullName || '').trim();
    const email = limparEmail(req.body.email);
    const senha = String(req.body.password || '');
    const tipoConta = String(req.body.accountType || '').trim().toUpperCase();

    // RF03: validar campos obrigatórios.
    if (!nome || !email || !senha || !tipoConta) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    // RF03: validar tamanho mínimo da senha.
    if (senha.length < 6) {
      return res.status(400).json({ message: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    // RF02: aceitar somente CLIENTE ou PRESTADOR.
    if (tipoConta !== 'CLIENTE' && tipoConta !== 'PRESTADOR') {
      return res.status(400).json({ message: 'Tipo de conta inválido.' });
    }

    // RF04: impedir cadastro com email já existente.
    const usuarioExistente = await buscarUm(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (usuarioExistente) {
      return res.status(409).json({ message: 'Já existe uma conta com esse email.' });
    }

    // RF05: criptografar senha antes de salvar.
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // RF01: cadastrar usuário no banco.
    const resultado = await executar(
      `
        INSERT INTO users (full_name, email, password_hash, account_type)
        VALUES (?, ?, ?, ?)
      `,
      [nome, email, senhaCriptografada, tipoConta]
    );

    // RF06: se for prestador, criar o perfil inicial automaticamente.
    if (tipoConta === 'PRESTADOR') {
      await executar(
        `
          INSERT INTO provider_profiles (user_id, description)
          VALUES (?, ?)
        `,
        [resultado.id, 'Novo prestador cadastrado na plataforma.']
      );
    }

    // Busca o usuário recém-criado, sem trazer password_hash.
    const usuarioCriado = await buscarUm(
      `
        SELECT id, full_name, email, account_type, created_at
        FROM users
        WHERE id = ?
      `,
      [resultado.id]
    );

    // RF08: gerar token JWT após cadastro.
    return res.status(201).json({
      message: 'Conta criada com sucesso.',
      user: montarUsuarioParaResposta(usuarioCriado),
      token: criarToken(usuarioCriado)
    });
  } catch (erro) {
    console.error('Erro no cadastro:', erro.message);
    return res.status(500).json({ message: 'Erro ao criar conta.' });
  }
});

/*
  POST /api/auth/login
  -----------------------------------------------------------------------------
  Fluxo do login:
  1. recebe email e senha;
  2. procura usuário pelo email;
  3. verifica se o usuário existe e está ativo;
  4. compara senha digitada com hash salvo;
  5. gera JWT;
  6. devolve usuário + token.
*/
router.post('/login', async (req, res) => {
  try {
    const email = limparEmail(req.body.email);
    const senha = String(req.body.password || '');

    if (!email || !senha) {
      return res.status(400).json({ message: 'Informe email e senha.' });
    }

    // RF07: permitir login com email e senha.
    const usuario = await buscarUm(
      `
        SELECT id, full_name, email, password_hash, account_type, active, created_at
        FROM users
        WHERE email = ?
      `,
      [email]
    );

    // Mensagem genérica para não revelar se o email existe.
    if (!usuario || usuario.active !== 1) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // bcrypt.compare compara a senha digitada com o hash do banco.
    const senhaCorreta = await bcrypt.compare(senha, usuario.password_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // RF08: gerar token JWT após login.
    return res.json({
      message: 'Login realizado com sucesso.',
      user: montarUsuarioParaResposta(usuario),
      token: criarToken(usuario)
    });
  } catch (erro) {
    console.error('Erro no login:', erro.message);
    return res.status(500).json({ message: 'Erro ao fazer login.' });
  }
});

/*
  GET /api/auth/me
  -----------------------------------------------------------------------------
  RF10: rota protegida para consultar o usuário logado.

  Antes da função final rodar, o Express executa authMiddleware.
  Se o token for válido, o middleware coloca o usuário em req.user.
*/
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
