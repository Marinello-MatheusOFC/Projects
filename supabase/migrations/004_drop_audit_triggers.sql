-- =====================================================================
-- 004_drop_audit_triggers.sql
-- Remove os triggers automáticos de audit_logs (log_audit_from_trigger)
-- que causavam DUPLICAÇÃO com as chamadas logAudit() feitas pelo app.
--
-- Os logs de auditoria agora ficam exclusivamente sob responsabilidade
-- da camada de aplicação (logAudit em src/services/audit.ts), que já
-- cobre: criação, atualização, exclusão, publicação, arquivamento,
-- restauração, uploads e mudanças de status com labels semânticos.
--
-- O script também dropa a função log_audit_from_trigger, caso não
-- seja usada por nenhum outro objeto.
-- =====================================================================

-- 1. Remover triggers de auditoria (DROP IF EXISTS por segurança)
DROP TRIGGER IF EXISTS audit_animals_trg    ON public.animals;
DROP TRIGGER IF EXISTS audit_events_trg    ON public.events;
DROP TRIGGER IF EXISTS audit_news_trg      ON public.news_posts;
DROP TRIGGER IF EXISTS audit_products_trg  ON public.products;
DROP TRIGGER IF EXISTS audit_settings_trg  ON public.site_settings;
DROP TRIGGER IF EXISTS audit_profiles_trg  ON public.profiles;

-- 2. Remover a função trigger (somente se não for referenciada)
DROP FUNCTION IF EXISTS public.log_audit_from_trigger();
