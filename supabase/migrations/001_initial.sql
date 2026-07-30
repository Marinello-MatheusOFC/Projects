-- 001_create_profiles.sql
-- Migration inicial: criação da tabela profiles e funções de autorização

-- Função para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Superadmin pode ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY "Superadmin pode atualizar perfis"
  ON public.profiles FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Trigger para criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'), 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela animals
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  birth_date_estimate DATE,
  age_text TEXT,
  description TEXT,
  history TEXT,
  health_notes TEXT,
  personality TEXT,
  compatibility_notes TEXT,
  vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  neutered BOOLEAN NOT NULL DEFAULT FALSE,
  special_needs BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'in_process', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_animals_slug ON public.animals(slug);
CREATE INDEX idx_animals_status ON public.animals(status);
CREATE INDEX idx_animals_published ON public.animals(published) WHERE published = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_animals_featured ON public.animals(featured) WHERE featured = TRUE;
CREATE INDEX idx_animals_species ON public.animals(species);
CREATE INDEX idx_animals_deleted ON public.animals(deleted_at) WHERE deleted_at IS NULL;

-- Políticas RLS para animals
CREATE POLICY "Público pode ler animais publicados"
  ON public.animals FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar animais"
  ON public.animals FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela animal_images
CREATE TABLE public.animal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_animal_images_animal ON public.animal_images(animal_id);

CREATE POLICY "Público pode ler imagens de animais publicados"
  ON public.animal_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE id = animal_id AND published = TRUE AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admin pode gerenciar imagens"
  ON public.animal_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela adoption_applications
CREATE TABLE public.adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  housing_type TEXT NOT NULL CHECK (housing_type IN ('house', 'apartment', 'other')),
  has_protective_screens BOOLEAN NOT NULL DEFAULT FALSE,
  has_other_animals BOOLEAN NOT NULL DEFAULT FALSE,
  household_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT NOT NULL,
  availability TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'interview', 'approved', 'rejected', 'cancelled', 'completed')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_adoption_applications_updated_at
  BEFORE UPDATE ON public.adoption_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_adoption_applications_status ON public.adoption_applications(status);
CREATE INDEX idx_adoption_applications_animal ON public.adoption_applications(animal_id);

CREATE POLICY "Visitante pode inserir solicitação"
  ON public.adoption_applications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar solicitações"
  ON public.adoption_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela adoption_status_history
CREATE TABLE public.adoption_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.adoption_applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adoption_status_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_adoption_history_application ON public.adoption_status_history(application_id);

CREATE POLICY "Admin pode ler histórico"
  ON public.adoption_status_history FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin pode criar histórico"
  ON public.adoption_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- Tabela events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location_name TEXT,
  address TEXT,
  external_url TEXT,
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_start ON public.events(start_at);
CREATE INDEX idx_events_published ON public.events(published) WHERE published = TRUE AND deleted_at IS NULL;

CREATE POLICY "Público pode ler eventos publicados"
  ON public.events FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar eventos"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela news_posts
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_news_slug ON public.news_posts(slug);
CREATE INDEX idx_news_status ON public.news_posts(status) WHERE status = 'published' AND deleted_at IS NULL;

CREATE POLICY "Público pode ler notícias publicadas"
  ON public.news_posts FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar notícias"
  ON public.news_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ler categorias"
  ON public.categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin pode gerenciar categorias"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela post_categories
CREATE TABLE public.post_categories (
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ler post_categories"
  ON public.post_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin pode gerenciar post_categories"
  ON public.post_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES public.categories(id),
  image_path TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_published ON public.products(published) WHERE published = TRUE AND deleted_at IS NULL;

CREATE POLICY "Público pode ler produtos publicados"
  ON public.products FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar produtos"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela contact_messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

CREATE POLICY "Visitante pode inserir mensagem"
  ON public.contact_messages FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar mensagens"
  ON public.contact_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela volunteer_applications
CREATE TABLE public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  availability TEXT NOT NULL,
  interests TEXT NOT NULL,
  experience TEXT,
  message TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'approved', 'rejected', 'archived')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_volunteer_applications_status ON public.volunteer_applications(status);

CREATE POLICY "Visitante pode inserir inscrição"
  ON public.volunteer_applications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar inscrições"
  ON public.volunteer_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela gallery_albums
CREATE TABLE public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_path TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_gallery_albums_slug ON public.gallery_albums(slug);
CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(published) WHERE published = TRUE;

CREATE POLICY "Público pode ler álbuns publicados"
  ON public.gallery_albums FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admin pode gerenciar álbuns"
  ON public.gallery_albums FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela gallery_images
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_gallery_images_album ON public.gallery_images(album_id);

CREATE POLICY "Público pode ler imagens de álbuns publicados"
  ON public.gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gallery_albums
      WHERE id = album_id AND published = TRUE
    )
  );

CREATE POLICY "Admin pode gerenciar imagens da galeria"
  ON public.gallery_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela site_settings
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_json JSONB NOT NULL DEFAULT '{}',
  public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Público pode ler configurações públicas"
  ON public.site_settings FOR SELECT
  USING (public = TRUE);

CREATE POLICY "Admin pode gerenciar configurações"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela audit_logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

CREATE POLICY "Superadmin pode ler logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY "Sistema pode inserir logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());
