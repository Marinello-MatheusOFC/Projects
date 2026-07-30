import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminRoute } from '@/features/auth/components/AdminRoute';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const AdoptionPage = lazy(() => import('@/pages/public/AdoptionPage'));
const AnimalDetailPage = lazy(() => import('@/pages/public/AnimalDetailPage'));
const AdoptionProcessPage = lazy(() => import('@/pages/public/AdoptionProcessPage'));
const HowToHelpPage = lazy(() => import('@/pages/public/HowToHelpPage'));
const VolunteeringPage = lazy(() => import('@/pages/public/VolunteeringPage'));
const EventsPage = lazy(() => import('@/pages/public/EventsPage'));
const EventDetailPage = lazy(() => import('@/pages/public/EventDetailPage'));
const NewsPage = lazy(() => import('@/pages/public/NewsPage'));
const NewsDetailPage = lazy(() => import('@/pages/public/NewsDetailPage'));
const ProductsPage = lazy(() => import('@/pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'));
const GalleryPage = lazy(() => import('@/pages/public/GalleryPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('@/pages/errors/ServerErrorPage'));
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminAnimalsPage = lazy(() => import('@/pages/admin/AdminAnimalsPage'));
const AdminAnimalsFormPage = lazy(() => import('@/pages/admin/AdminAnimalsFormPage'));
const AdminAdoptionsPage = lazy(() => import('@/pages/admin/AdminAdoptionsPage'));
const AdminEventsPage = lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminEventsFormPage = lazy(() => import('@/pages/admin/AdminEventsFormPage'));
const AdminNewsPage = lazy(() => import('@/pages/admin/AdminNewsPage'));
const AdminNewsFormPage = lazy(() => import('@/pages/admin/AdminNewsFormPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductsFormPage = lazy(() => import('@/pages/admin/AdminProductsFormPage'));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage'));
const AdminVolunteersPage = lazy(() => import('@/pages/admin/AdminVolunteersPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

function PageLoader() {
  return (
    <div className="page-loading" role="status" aria-label="Carregando...">
      <div className="spinner" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/adocao" element={<AdoptionPage />} />
          <Route path="/adocao/:slug" element={<AnimalDetailPage />} />
          <Route path="/processo-de-adocao" element={<AdoptionProcessPage />} />
          <Route path="/como-ajudar" element={<HowToHelpPage />} />
          <Route path="/voluntariado" element={<VolunteeringPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:slug" element={<EventDetailPage />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/noticias/:slug" element={<NewsDetailPage />} />
          <Route path="/brecho" element={<ProductsPage />} />
          <Route path="/brecho/:slug" element={<ProductDetailPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/contato" element={<ContactPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="animais" element={<AdminAnimalsPage />} />
          <Route path="animais/novo" element={<AdminAnimalsFormPage />} />
          <Route path="animais/:id/editar" element={<AdminAnimalsFormPage />} />
          <Route path="adocoes" element={<AdminAdoptionsPage />} />
          <Route path="eventos" element={<AdminEventsPage />} />
          <Route path="eventos/novo" element={<AdminEventsFormPage />} />
          <Route path="eventos/:id/editar" element={<AdminEventsFormPage />} />
          <Route path="noticias" element={<AdminNewsPage />} />
          <Route path="noticias/novo" element={<AdminNewsFormPage />} />
          <Route path="noticias/:id/editar" element={<AdminNewsFormPage />} />
          <Route path="produtos" element={<AdminProductsPage />} />
          <Route path="produtos/novo" element={<AdminProductsFormPage />} />
          <Route path="produtos/:id/editar" element={<AdminProductsFormPage />} />
          <Route path="mensagens" element={<AdminMessagesPage />} />
          <Route path="voluntarios" element={<AdminVolunteersPage />} />
          <Route path="configuracoes" element={<AdminSettingsPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
        </Route>

        <Route path="/acesso-negado" element={<ForbiddenPage />} />
        <Route path="/erro" element={<ServerErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
