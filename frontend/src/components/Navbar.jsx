import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">TW</span>
        <span>To Work</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Início</NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <span className="nav-user">Olá, {user?.fullName?.split(' ')[0]}</span>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Entrar</NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Criar conta
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
