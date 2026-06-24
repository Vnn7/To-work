/*
  AuthContext.jsx
  -----------------------------------------------------------------------------
  Este é o arquivo mais importante do front-end para autenticação.

  Ele guarda e compartilha:
  - usuário logado;
  - estado de carregamento;
  - função de login;
  - função de cadastro;
  - função de logout.

  Por que usar Context?
  Porque várias telas precisam saber se existe usuário logado.
  Com Context, não precisamos passar user, login e logout manualmente de tela em tela.
*/

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api.js';

const AuthContext = createContext();

// Nome da chave usada no localStorage.
// RF09: o front-end deve armazenar o token para manter o usuário autenticado.
const TOKEN_KEY = '@towork:token';

export function AuthProvider({ children }) {
  // user guarda os dados do usuário logado.
  // Se user for null, significa que ninguém está logado.
  const [user, setUser] = useState(null);

  // loading evita que a tela pisque enquanto verificamos se já existe token salvo.
  const [loading, setLoading] = useState(true);

  /*
    salvarSessao()
    ---------------------------------------------------------------------------
    Usada depois do cadastro ou login.

    A API devolve:
    {
      user: {...},
      token: "..."
    }

    Então salvamos:
    - token no navegador;
    - usuário no estado React.
  */
  function salvarSessao(dados) {
    localStorage.setItem(TOKEN_KEY, dados.token);
    setUser(dados.user);
  }

  /*
    montarHeaderComToken()
    ---------------------------------------------------------------------------
    Rotas protegidas precisam receber o token no cabeçalho Authorization.

    O back-end espera este formato:
    Authorization: Bearer TOKEN_AQUI
  */
  function montarHeaderComToken(token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /*
    carregarUsuarioLogado()
    ---------------------------------------------------------------------------
    Roda quando a aplicação abre.

    Se existir token salvo no navegador, o front-end pergunta ao back-end:
    "Esse token ainda é válido? Quem é esse usuário?"

    A rota usada é GET /api/auth/me.
  */
  async function carregarUsuarioLogado() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const resposta = await api.get('/auth/me', montarHeaderComToken(token));
      setUser(resposta.data.user);
    } catch (erro) {
      // Se o token expirou ou é inválido, removemos do navegador.
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // useEffect com [] roda apenas uma vez, quando a aplicação inicia.
  useEffect(() => {
    carregarUsuarioLogado();
  }, []);

  /*
    register()
    ---------------------------------------------------------------------------
    Chamada pela tela Register.jsx.

    Envia nome, email, senha e tipo de conta para o back-end.
    Se der certo, salva o token e o usuário.
  */
  async function register(fullName, email, password, accountType) {
    const resposta = await api.post('/auth/register', {
      fullName,
      email,
      password,
      accountType
    });

    salvarSessao(resposta.data);
  }

  /*
    login()
    ---------------------------------------------------------------------------
    Chamada pela tela Login.jsx.

    Envia email e senha para o back-end.
    Se as credenciais estiverem corretas, salva token e usuário.
  */
  async function login(email, password) {
    const resposta = await api.post('/auth/login', {
      email,
      password
    });

    salvarSessao(resposta.data);
  }

  /*
    logout()
    ---------------------------------------------------------------------------
    RF14: sair da conta removendo o token do navegador.
  */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/*
  useAuth()
  -----------------------------------------------------------------------------
  Hook simples para qualquer componente acessar o contexto de autenticação.

  Exemplo:
  const { user, login, logout } = useAuth();
*/
export function useAuth() {
  return useContext(AuthContext);
}
