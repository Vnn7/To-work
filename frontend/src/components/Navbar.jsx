/*
  Navbar.jsx
  -----------------------------------------------------------------------------
  Barra superior do sistema.

  Ela mostra links diferentes dependendo do estado de login:
  - visitante: Início, Entrar, Criar conta;
  - logado: Início, Dashboard, nome do usuário e botão Sair.
*/

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span>TW</span>
        To Work
      </Link>

      <nav>
        <Link to="/">Início</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user-name">Olá, {user.fullName}</span>
            <button className="link-button" onClick={sair}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register" className="nav-button">Criar conta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
