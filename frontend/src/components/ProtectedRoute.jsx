/*
  ProtectedRoute.jsx
  -----------------------------------------------------------------------------
  Este componente protege páginas que exigem login.

  No projeto, ele protege o Dashboard.
*/

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Enquanto o AuthContext verifica se existe token válido, mostramos carregando.
  if (loading) {
    return <p className="loading">Verificando autenticação...</p>;
  }

  // Se não houver usuário logado, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se existe usuário, libera a página protegida.
  return children;
}
