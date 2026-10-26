import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Cursos } from './pages/admin/Cursos';
import { Materias } from './pages/admin/Materias';
import { Auditoria, Docentes, Estudiantes } from './pages/admin/Personas';
import { MisCursos, PlanillaNotas } from './pages/docente/Docente';
import { Historial, Oferta } from './pages/estudiante/Estudiante';
import './styles.css';

/** Rutas agrupadas por rol: cada grupo solo es accesible para su rol. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<Layout roles={['ADMIN']} />}>
            <Route path="materias" element={<Materias />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="estudiantes" element={<Estudiantes />} />
            <Route path="estudiantes/:estudianteId/historial" element={<Historial />} />
            <Route path="docentes" element={<Docentes />} />
            <Route path="auditoria" element={<Auditoria />} />
          </Route>

          <Route path="/docente" element={<Layout roles={['DOCENTE']} />}>
            <Route path="cursos" element={<MisCursos />} />
            <Route path="cursos/:cursoId" element={<PlanillaNotas />} />
          </Route>

          <Route path="/estudiante" element={<Layout roles={['ESTUDIANTE']} />}>
            <Route path="oferta" element={<Oferta />} />
            <Route path="historial" element={<Historial />} />
          </Route>

          {/* Cualquier otra ruta va al login, que redirige al inicio del rol si ya hay sesión. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
