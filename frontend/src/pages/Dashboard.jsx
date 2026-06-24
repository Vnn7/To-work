/*
  Dashboard.jsx
  -----------------------------------------------------------------------------
  Área logada do sistema.

  Esta tela só aparece se ProtectedRoute confirmar que existe usuário logado.
*/

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <span className="eyebrow">Área logada</span>
        <h1>Olá, {user.fullName}</h1>
        <p>Esta tela só aparece quando existe um token JWT válido.</p>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h3>Dados da conta</h3>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tipo:</strong> {user.accountType}</p>
        </article>

        <article className="card">
          <h3>Próximo passo</h3>

          {user.accountType === 'PRESTADOR' ? (
            <p>O próximo módulo seria completar o perfil do prestador.</p>
          ) : (
            <p>O próximo módulo seria solicitar orçamento para prestadores.</p>
          )}

          <Link to="/" className="btn btn-outline">Voltar para início</Link>
        </article>
      </section>
    </div>
  );
}
