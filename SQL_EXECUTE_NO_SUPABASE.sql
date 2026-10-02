-- 🚀 INSTRUÇÕES: Execute este script no Supabase SQL Editor
-- Caminho: https://app.supabase.com > SQL Editor > New Query > Cole aqui > Execute

-- ⚠️ IMPORTANTE: Se a tabela já existe, faça backup primeiro!
-- Comentamos o DROP abaixo para segurança. Descomente se tiver certeza.

-- DROP TABLE IF EXISTS public.appointments CASCADE;

-- Criar tabela appointments com todas as colunas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (phone ~ '^\d{10,11}$'),
  service TEXT NOT NULL CHECK (service IN (
    'Clássico',
    'Volume Brasileiro',
    'Volume Russo',
    'Híbrido',
    'Mega Volume',
    'Manutenção',
    'Fox Eyes'
  )),
  date DATE NOT NULL,
  time TIME NOT NULL CHECK (time IN (
    '09:00', '10:00', '11:00', '13:00',
    '14:00', '15:00', '16:00', '17:00'
  )),
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS appointments_user_date ON public.appointments(user_id, date, time);
CREATE INDEX IF NOT EXISTS appointments_confirmed ON public.appointments(confirmed);

-- Ativar Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remover permissões para usuários anônimos
REVOKE ALL ON public.appointments FROM anon;

-- Dar permissões apenas para usuários autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;

-- Policy: Ler meus agendamentos
CREATE POLICY "Ler meus agendamentos" ON public.appointments
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Policy: Criar meus agendamentos
CREATE POLICY "Criar meus agendamentos" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Editar meus agendamentos (e confirmar como admin)
CREATE POLICY "Editar meus agendamentos" ON public.appointments
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Excluir meus agendamentos
CREATE POLICY "Excluir meus agendamentos" ON public.appointments
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Ativar Realtime para sincronização em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- ✅ Pronto! A tabela está criada com:
-- - Row Level Security habilitado
-- - Tipagem forte (CHECK constraints)
-- - Índices otimizados
-- - Realtime ativado
