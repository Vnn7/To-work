/*
  Register.jsx
  -----------------------------------------------------------------------------
  Tela de cadastro.

  Fluxo:
  1. usuário informa nome, email, senha e tipo de conta;
  2. o formulário chama criarConta();
  3. criarConta() chama register() do AuthContext;
  4. AuthContext envia POST /api/auth/register;
  5. se der certo, token é salvo e o usuário vai para /dashboard.
*/

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('CLIENTE');
  const [error, setError] = useState('');

  async function criarConta(event) {
    event.preventDefault();
    setError('');

    try {
      await register(fullName, email, password, accountType);
      navigate('/dashboard');
    } catch (erro) {
      setError(erro.response?.data?.message || 'Não foi possível criar a conta.');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={criarConta}>
        <span className="eyebrow">Crie sua conta</span>
        <h1>Cadastro</h1>
        <p>Escolha se você quer contratar serviços ou oferecer serviços.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Nome completo
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </label>

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
            minLength="6"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label>
          Tipo de conta
          <select value={accountType} onChange={(event) => setAccountType(event.target.value)}>
            <option value="CLIENTE">Cliente - Quero contratar serviços</option>
            <option value="PRESTADOR">Prestador - Quero oferecer serviços</option>
          </select>
        </label>

        <button className="btn btn-primary btn-full">Criar conta</button>

        <p className="form-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
