/*
  Home.jsx
  -----------------------------------------------------------------------------
  Página inicial pública.

  Ela consome duas rotas do back-end:
  - GET /api/categories
  - GET /api/professionals

  Essas informações vêm do SQLite por meio da API Express.
*/

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';

export default function Home() {
  // categories guarda a lista de categorias recebidas da API.
  const [categories, setCategories] = useState([]);

  // professionals guarda a lista de prestadores recebidos da API.
  const [professionals, setProfessionals] = useState([]);

  /*
    carregarDadosDaHome()
    ---------------------------------------------------------------------------
    Chama a API e preenche os estados da página.
  */
  async function carregarDadosDaHome() {
    try {
      const respostaCategorias = await api.get('/categories');
      setCategories(respostaCategorias.data.categories);

      const respostaPrestadores = await api.get('/professionals');
      setProfessionals(respostaPrestadores.data.professionals);
    } catch (erro) {
      console.log('Erro ao carregar dados da Home:', erro.message);
    }
  }

  // useEffect roda uma vez quando a Home abre.
  useEffect(() => {
    carregarDadosDaHome();
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="eyebrow">Conecte clientes e profissionais</span>
          <h1>Encontre prestadores de serviço de forma rápida e segura.</h1>
          <p>
            O To Work ajuda clientes a encontrar profissionais e permite que
            prestadores divulguem seus serviços.
          </p>

          <div className="actions">
            <Link to="/register" className="btn btn-primary">Começar agora</Link>
            <Link to="/login" className="btn btn-outline">Já tenho conta</Link>
          </div>
        </div>

        {/* Card visual de busca. Nesta versão, a busca avançada ainda é evolução futura. */}
        <div className="search-card">
          <label>Que serviço você precisa?</label>
          <input placeholder="Ex: eletricista, limpeza, informática..." />
          <button className="btn btn-primary">Buscar</button>
        </div>
      </section>

      <section className="section">
        <h2>Categorias populares</h2>
        <p>Alguns tipos de serviços que a plataforma organiza.</p>

        <div className="grid">
          {categories.map((category) => (
            <article className="card" key={category.id}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <h2>Prestadores cadastrados</h2>
        <p>Quando alguém se cadastra como prestador, aparece nesta área.</p>

        {professionals.length === 0 ? (
          <div className="card">
            <h3>Nenhum prestador cadastrado ainda.</h3>
            <p>Crie uma conta do tipo PRESTADOR para testar o fluxo completo.</p>
          </div>
        ) : (
          <div className="grid">
            {professionals.map((professional) => (
              <article className="card professional" key={professional.id}>
                <div className="avatar">{professional.fullName?.charAt(0)}</div>
                <div>
                  <h3>{professional.fullName}</h3>
                  <p>{professional.description}</p>
                  <small>Avaliação {professional.rating || 0}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
