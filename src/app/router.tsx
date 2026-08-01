import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminRoute } from '@/features/auth/components/AdminRoute';
import { AdminModuleRoute } from '@/features/auth/components/AdminModuleRoute';
import type { AdminModule } from '@/features/auth/permissions';

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
const AdminAnimalsDetailPage = lazy(() => import('@/pages/admin/AdminAnimalsDetailPage'));
const AdminAdoptionsPage = lazy(() => import('@/pages/admin/AdminAdoptionsPage'));
const AdminAdoptionsDetailPage = lazy(() => import('@/pages/admin/AdminAdoptionsDetailPage'));
const AdminEventsPage = lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminEventsFormPage = lazy(() => import('@/pages/admin/AdminEventsFormPage'));
const AdminNewsPage = lazy(() => import('@/pages/admin/AdminNewsPage'));
const AdminNewsFormPage = lazy(() => import('@/pages/admin/AdminNewsFormPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductsFormPage = lazy(() => import('@/pages/admin/AdminProductsFormPage'));
const AdminGalleryPage = lazy(() => import('@/pages/admin/AdminGalleryPage'));
const AdminGalleryFormPage = lazy(() => import('@/pages/admin/AdminGalleryFormPage'));
const AdminGalleryDetailPage = lazy(() => import('@/pages/admin/AdminGalleryDetailPage'));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage'));
const AdminMessagesDetailPage = lazy(() => import('@/pages/admin/AdminMessagesDetailPage'));
const AdminVolunteersPage = lazy(() => import('@/pages/admin/AdminVolunteersPage'));
const AdminVolunteersDetailPage = lazy(() => import('@/pages/admin/AdminVolunteersDetailPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'));
const AdminForbiddenPage = lazy(() => import('@/pages/admin/AdminForbiddenPage'));

function PageLoader() {
  return (
    <div className="page-loading" role="status" aria-label="Carregando...">
      <div className="spinner" />
    </div>
  );
}

function GuardedRoute({ module, children }: { module: AdminModule; children: React.ReactNode }) {
  return (
    <AdminModuleRoute module={module}>
      <>{children}</>
    </AdminModuleRoute>
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
        <Route path="/admin/403" element={<AdminForbiddenPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="animais"
            element={<GuardedRoute module="animais"><AdminAnimalsPage /></GuardedRoute>}
          />
          <Route
            path="animais/novo"
            element={<GuardedRoute module="animais"><AdminAnimalsFormPage /></GuardedRoute>}
          />
          <Route
            path="animais/:id"
            element={<GuardedRoute module="animais"><AdminAnimalsDetailPage /></GuardedRoute>}
          />
          <Route
            path="animais/:id/editar"
            element={<GuardedRoute module="animais"><AdminAnimalsFormPage /></GuardedRoute>}
          />
          <Route
            path="adocoes"
            element={<GuardedRoute module="adocoes"><AdminAdoptionsPage /></GuardedRoute>}
          />
          <Route
            path="adocoes/:id"
            element={<GuardedRoute module="adocoes"><AdminAdoptionsDetailPage /></GuardedRoute>}
          />
          <Route
            path="eventos"
            element={<GuardedRoute module="eventos"><AdminEventsPage /></GuardedRoute>}
          />
          <Route
            path="eventos/novo"
            element={<GuardedRoute module="eventos"><AdminEventsFormPage /></GuardedRoute>}
          />
          <Route
            path="eventos/:id/editar"
            element={<GuardedRoute module="eventos"><AdminEventsFormPage /></GuardedRoute>}
          />
          <Route
            path="noticias"
            element={<GuardedRoute module="noticias"><AdminNewsPage /></GuardedRoute>}
          />
          <Route
            path="noticias/novo"
            element={<GuardedRoute module="noticias"><AdminNewsFormPage /></GuardedRoute>}
          />
          <Route
            path="noticias/:id/editar"
            element={<GuardedRoute module="noticias"><AdminNewsFormPage /></GuardedRoute>}
          />
          <Route
            path="produtos"
            element={<GuardedRoute module="produtos"><AdminProductsPage /></GuardedRoute>}
          />
          <Route
            path="produtos/novo"
            element={<GuardedRoute module="produtos"><AdminProductsFormPage /></GuardedRoute>}
          />
          <Route
            path="produtos/:id/editar"
            element={<GuardedRoute module="produtos"><AdminProductsFormPage /></GuardedRoute>}
          />
          <Route
            path="galeria"
            element={<GuardedRoute module="galeria"><AdminGalleryPage /></GuardedRoute>}
          />
          <Route
            path="galeria/novo"
            element={<GuardedRoute module="galeria"><AdminGalleryFormPage /></GuardedRoute>}
          />
          <Route
            path="galeria/:id"
            element={<GuardedRoute module="galeria"><AdminGalleryDetailPage /></GuardedRoute>}
          />
          <Route
            path="galeria/:id/editar"
            element={<GuardedRoute module="galeria"><AdminGalleryFormPage /></GuardedRoute>}
          />
          <Route
            path="mensagens"
            element={<GuardedRoute module="mensagens"><AdminMessagesPage /></GuardedRoute>}
          />
          <Route
            path="mensagens/:id"
            element={<GuardedRoute module="mensagens"><AdminMessagesDetailPage /></GuardedRoute>}
          />
          <Route
            path="voluntarios"
            element={<GuardedRoute module="voluntarios"><AdminVolunteersPage /></GuardedRoute>}
          />
          <Route
            path="voluntarios/:id"
            element={<GuardedRoute module="voluntarios"><AdminVolunteersDetailPage /></GuardedRoute>}
          />
          <Route
            path="configuracoes"
            element={<GuardedRoute module="configuracoes"><AdminSettingsPage /></GuardedRoute>}
          />
          <Route
            path="usuarios"
            element={<GuardedRoute module="usuarios"><AdminUsersPage /></GuardedRoute>}
          />
          <Route
            path="auditoria"
            element={<GuardedRoute module="auditoria"><AdminAuditPage /></GuardedRoute>}
          />
        </Route>

        <Route path="/acesso-negado" element={<ForbiddenPage />} />
        <Route path="/erro" element={<ServerErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
