/*
  Login.jsx
  -----------------------------------------------------------------------------
  Tela de login.

  Fluxo:
  1. usuário digita email e senha;
  2. o formulário chama a função entrar();
  3. entrar() chama login() do AuthContext;
  4. AuthContext envia POST /api/auth/login;
  5. se der certo, o usuário vai para /dashboard.
*/

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function entrar(event) {
    // Evita o recarregamento padrão do formulário HTML.
    event.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (erro) {
      setError(erro.response?.data?.message || 'Não foi possível fazer login.');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={entrar}>
        <span className="eyebrow">Bem-vindo de volta</span>
        <h1>Entrar na conta</h1>
        <p>Acesse sua conta para continuar usando a plataforma.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button className="btn btn-primary btn-full">Entrar</button>

        <p className="form-footer">
          Ainda não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
