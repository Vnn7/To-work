## Estrutura do projeto

```text
To-work-didatico/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── database.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       └── publicRoutes.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── .env.example
```

## Como rodar o back-end

Entre na pasta do back-end:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, pode usar:

```powershell
copy .env.example .env
```

Inicie a API:

```bash
npm run dev
```

A API deve rodar em:

```text
http://localhost:3001
```

Teste:

```text
http://localhost:3001/api/health
```

## Como rodar o front-end

Em outro terminal, entre na pasta do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
copy .env.example .env
```

Inicie o Vite:

```bash
npm run dev
```

O front-end deve abrir em:

```text
http://localhost:5173
```

## Fluxo principal

```text
Usuário abre a Home
  ↓
Front-end chama /api/categories e /api/professionals
  ↓
Back-end busca dados no SQLite
  ↓
Usuário cria conta ou faz login
  ↓
Back-end valida dados, usa bcryptjs e gera JWT
  ↓
Front-end salva token no localStorage
  ↓
Dashboard só abre se o token for válido
```