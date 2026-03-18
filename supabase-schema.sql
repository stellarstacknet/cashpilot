-- CashPilot DB Schema for Supabase
-- Supabase SQL Editor에서 실행하세요.

-- 계좌 테이블
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  bank text not null,
  balance bigint not null default 0,
  purpose text not null default 'general',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 카드 테이블
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  issuer text not null,
  payment_day int not null default 15,
  linked_account_id uuid references public.accounts(id) on delete set null,
  overdue_rate numeric(5,2) not null default 19.9,
  color text not null default '#3B82F6',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 청구서 테이블
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  year int not null,
  month int not null,
  amount bigint not null default 0,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, card_id, year, month)
);

-- 스냅샷 테이블
create table public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year int not null,
  month int not null,
  total_income bigint not null default 0,
  total_bills bigint not null default 0,
  total_savings bigint not null default 0,
  bills jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(user_id, year, month)
);

-- RLS 정책: 사용자 본인 데이터만 접근 가능
alter table public.accounts enable row level security;
alter table public.cards enable row level security;
alter table public.bills enable row level security;
alter table public.snapshots enable row level security;

create policy "Users can manage own accounts" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own cards" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own bills" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own snapshots" on public.snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger accounts_updated_at before update on public.accounts
  for each row execute function public.handle_updated_at();

create trigger cards_updated_at before update on public.cards
  for each row execute function public.handle_updated_at();

create trigger bills_updated_at before update on public.bills
  for each row execute function public.handle_updated_at();
