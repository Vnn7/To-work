/*
  database.js
  -----------------------------------------------------------------------------
  Este arquivo é a ponte entre o back-end e o banco SQLite.

  O SQLite salva os dados em um arquivo local:
  backend/data/to_work.sqlite

  Aqui ficam:
  - abertura do banco;
  - funções simples para executar SQL;
  - criação das tabelas;
  - criação das categorias iniciais.
*/

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Caminho do arquivo do banco. Vem do .env ou usa o caminho padrão.
const arquivoBanco = process.env.DATABASE_FILE || './data/to_work.sqlite';

// __dirname é a pasta atual: backend/src.
// O '..' sobe para backend/.
const caminhoBanco = path.resolve(__dirname, '..', arquivoBanco);
const pastaBanco = path.dirname(caminhoBanco);

// Se a pasta data/ não existir, o Node cria automaticamente.
if (!fs.existsSync(pastaBanco)) {
  fs.mkdirSync(pastaBanco, { recursive: true });
}

// Abre o arquivo SQLite. Se o arquivo não existir, o SQLite cria.
const db = new sqlite3.Database(caminhoBanco);

/*
  Função executar()
  -----------------------------------------------------------------------------
  Usada quando o SQL muda alguma coisa no banco.

  Exemplos:
  - CREATE TABLE
  - INSERT
  - UPDATE
  - DELETE

  Ela retorna:
  - id: ID do último registro criado;
  - alteracoes: quantidade de linhas alteradas.
*/
function executar(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parametros, function (erro) {
      if (erro) {
        return reject(erro);
      }

      return resolve({
        id: this.lastID,
        alteracoes: this.changes
      });
    });
  });
}

/*
  Função buscarUm()
  -----------------------------------------------------------------------------
  Usada quando esperamos apenas um resultado.

  Exemplo:
  "Buscar um usuário pelo email".
*/
function buscarUm(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, parametros, (erro, linha) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(linha);
    });
  });
}

/*
  Função buscarTodos()
  -----------------------------------------------------------------------------
  Usada quando esperamos uma lista de resultados.

  Exemplo:
  "Buscar todas as categorias".
*/
function buscarTodos(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, parametros, (erro, linhas) => {
      if (erro) {
        return reject(erro);
      }

      return resolve(linhas);
    });
  });
}

/*
  iniciarBanco()
  -----------------------------------------------------------------------------
  Esta função roda quando o servidor inicia.

  Ela cria as tabelas se elas ainda não existirem.
  Isso facilita a apresentação, porque o projeto já prepara o banco sozinho.
*/
async function iniciarBanco() {
  // Ativa as chaves estrangeiras no SQLite.
  // Isso faz os relacionamentos entre tabelas funcionarem corretamente.
  await executar('PRAGMA foreign_keys = ON');

  /*
    Tabela users
    ---------------------------------------------------------------------------
    Guarda os dados principais de qualquer usuário.

    Um usuário pode ser:
    - CLIENTE: pessoa que procura serviços;
    - PRESTADOR: pessoa que oferece serviços.
  */
  await executar(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK (account_type IN ('CLIENTE', 'PRESTADOR')),
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /*
    Tabela categories
    ---------------------------------------------------------------------------
    Guarda as categorias de serviço exibidas na Home.

    Exemplos:
    - Elétrica
    - Limpeza
    - Informática
  */
  await executar(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /*
    Tabela provider_profiles
    ---------------------------------------------------------------------------
    Guarda dados extras apenas dos usuários que são PRESTADORES.

    A tabela users guarda login e dados básicos.
    A tabela provider_profiles guarda dados profissionais.
  */
  await executar(`
    CREATE TABLE IF NOT EXISTS provider_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      phone TEXT,
      city TEXT,
      state TEXT,
      description TEXT,
      base_price REAL,
      rating REAL NOT NULL DEFAULT 0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  /*
    Tabela provider_categories
    ---------------------------------------------------------------------------
    Liga prestadores a categorias.

    Ela existe porque:
    - um prestador pode atuar em várias categorias;
    - uma categoria pode ter vários prestadores.

    Essa é uma relação muitos-para-muitos.
  */
  await executar(`
    CREATE TABLE IF NOT EXISTS provider_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (provider_id, category_id),
      FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  /*
    Categorias iniciais
    ---------------------------------------------------------------------------
    INSERT OR IGNORE significa:
    "insira se ainda não existir; se já existir, ignore".

    Isso evita duplicar categorias toda vez que a API inicia.
  */
  const categoriasIniciais = [
    ['Limpeza', 'Diaristas, limpeza residencial e comercial.'],
    ['Elétrica', 'Instalações, reparos e manutenção elétrica.'],
    ['Hidráulica', 'Encanadores, vazamentos e instalações hidráulicas.'],
    ['Pintura', 'Pintura residencial, comercial e pequenos reparos.'],
    ['Jardinagem', 'Manutenção de jardins, poda e paisagismo.'],
    ['Informática', 'Suporte técnico, manutenção de computadores e redes.']
  ];

  for (const categoria of categoriasIniciais) {
    await executar(
      'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
      categoria
    );
  }
}

module.exports = {
  executar,
  buscarUm,
  buscarTodos,
  iniciarBanco
};
