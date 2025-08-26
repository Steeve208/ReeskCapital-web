-- ========================================
-- SUPABASE ARCHITECTURE SETUP FOR RSC MINING
-- ========================================

-- Perfiles (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role text default 'user',
  created_at timestamptz default now()
);

-- Sesiones de minería
create table public.mining_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active', -- active|ended|timeout
  device_fingerprint text,
  user_agent text,
  ip text,
  total_seconds int default 0,
  tokens_earned numeric(18,8) default 0,
  created_at timestamptz default now()
);

-- Saldos "off-chain" (para la migración a mainnet)
create table public.balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rsc_available numeric(18,8) default 0,
  rsc_locked numeric(18,8) default 0,
  updated_at timestamptz default now()
);

-- Eventos/analítica básica
create table public.mining_events (
  id bigserial primary key,
  session_id uuid references public.mining_sessions(id) on delete cascade,
  kind text,            -- start|heartbeat|stop|timeout
  ts timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.mining_sessions enable row level security;
alter table public.balances enable row level security;
alter table public.mining_events enable row level security;

-- Políticas: cada usuario ve solo lo suyo
create policy "profiles_self" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

create policy "sessions_own" on public.mining_sessions
  for select using (auth.uid() = user_id);

create policy "balances_own" on public.balances
  for select using (auth.uid() = user_id);

create policy "events_own" on public.mining_events
  for select using (
    exists (select 1 from public.mining_sessions s
            where s.id = mining_events.session_id
              and s.user_id = auth.uid())
  );

-- Trigger: crear balance al registrarse
create or replace function public.create_balance_after_signup()
returns trigger language plpgsql as $$
begin
  insert into public.balances (user_id, rsc_available) values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_balance_after_signup();

-- Función SQL auxiliar para actualizar sesión y balance de forma atómica
create or replace function public.update_session_and_balance(
  p_session_id uuid,
  p_user_id uuid,
  p_add_seconds int,
  p_add_tokens numeric
) returns void language plpgsql as $$
begin
  update public.mining_sessions
    set total_seconds = total_seconds + p_add_seconds,
        tokens_earned = tokens_earned + p_add_tokens
  where id = p_session_id and user_id = p_user_id and status = 'active';

  update public.balances
    set rsc_available = rsc_available + p_add_tokens,
        updated_at = now()
  where user_id = p_user_id;
end $$;

-- Vista para admin
create view public.admin_sessions as
select s.*, u.email
from public.mining_sessions s
join public.profiles p on p.id = s.user_id
join auth.users u on u.id = s.user_id;

-- Índices para rendimiento
create index idx_mining_sessions_user_id on public.mining_sessions(user_id);
create index idx_mining_sessions_status on public.mining_sessions(status);
create index idx_mining_sessions_started_at on public.mining_sessions(started_at);
create index idx_mining_events_session_id on public.mining_events(session_id);
create index idx_mining_events_ts on public.mining_events(ts);

-- Comentarios
comment on table public.profiles is 'Perfiles de usuario que extienden auth.users';
comment on table public.mining_sessions is 'Sesiones activas de minería';
comment on table public.balances is 'Saldos off-chain de RSC';
comment on table public.mining_events is 'Eventos de minería para auditoría';
comment on function public.update_session_and_balance is 'Función atómica para actualizar sesión y balance';

-- Verificar configuración
select 
  'profiles' as table_name,
  count(*) as row_count
from public.profiles
union all
select 
  'mining_sessions' as table_name,
  count(*) as row_count
from public.mining_sessions
union all
select 
  'balances' as table_name,
  count(*) as row_count
from public.balances;
