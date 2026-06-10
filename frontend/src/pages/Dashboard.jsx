import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <span className="eyebrow">Área logada</span>
        <h1>Olá, {user?.fullName}</h1>
        <p>
          Seu login está funcionando. Essa tela só abre quando o token JWT é válido.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Dados da conta</h3>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Tipo:</strong> {user?.accountType}</p>
        </article>

        <article className="dashboard-card">
          <h3>Próximo passo</h3>
          {user?.accountType === 'PRESTADOR' ? (
            <p>Agora o próximo módulo seria permitir que o prestador complete perfil, telefone, cidade, preço base e categorias.</p>
          ) : (
            <p>Agora o próximo módulo seria permitir que o cliente busque prestadores e solicite orçamento.</p>
          )}
          <Link to="/" className="btn btn-outline">Voltar para início</Link>
        </article>
      </section>
    </div>
  );
}
