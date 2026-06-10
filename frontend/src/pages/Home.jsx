import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResponse, professionalsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/professionals')
        ]);

        setCategories(categoriesResponse.data.categories || []);
        setProfessionals(professionalsResponse.data.professionals || []);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Conecte clientes e profissionais</span>
          <h1>Encontre prestadores de serviço de forma rápida e segura.</h1>
          <p>
            O To Work ajuda clientes a encontrar profissionais e permite que prestadores divulguem seus serviços em uma plataforma simples.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">Começar agora</Link>
            <Link to="/login" className="btn btn-outline btn-large">Já tenho conta</Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="search-box">
            <label>Que serviço você precisa?</label>
            <input placeholder="Ex: eletricista, limpeza, informática..." />
            <button className="btn btn-primary" type="button">Buscar</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Categorias populares</h2>
          <p>Alguns tipos de serviços que a plataforma pode organizar.</p>
        </div>

        <div className="grid categories-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.id}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-header">
          <h2>Prestadores cadastrados</h2>
          <p>Quando alguém se cadastrar como prestador, ele aparece aqui.</p>
        </div>

        {professionals.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum prestador cadastrado ainda.</h3>
            <p>Crie uma conta como prestador para testar o fluxo completo.</p>
          </div>
        ) : (
          <div className="grid professionals-grid">
            {professionals.map((professional) => (
              <article className="professional-card" key={professional.id}>
                <div className="avatar">{professional.fullName?.charAt(0)}</div>
                <div>
                  <h3>{professional.fullName}</h3>
                  <p>{professional.description}</p>
                  <span className="tag">Avaliação {professional.rating || 0}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
