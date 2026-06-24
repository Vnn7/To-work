/*
  App.jsx
  -----------------------------------------------------------------------------
  Este arquivo organiza as páginas do front-end.

  Cada <Route> liga uma URL a uma tela.
*/

import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <>
      {/* Navbar aparece em todas as telas. */}
      <Navbar />

      <main>
        <Routes>
          {/* Página inicial pública. */}
          <Route path="/" element={<Home />} />

          {/* Tela de login pública. */}
          <Route path="/login" element={<Login />} />

          {/* Tela de cadastro pública. */}
          <Route path="/register" element={<Register />} />

          {/*
            Dashboard é protegido.
            Para abrir essa tela, primeiro passa pelo ProtectedRoute.
          */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
