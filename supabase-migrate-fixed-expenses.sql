-- 기존 Supabase DB에 fixed_expenses 테이블 추가 + cards에 sort_order 추가
-- Supabase SQL Editor에서 실행하세요.

-- 1. cards 테이블에 sort_order 컬럼 추가 (이미 있으면 무시)
alter table public.cards add column if not exists sort_order int not null default 0;

-- 2. 고정비 테이블 생성
create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount bigint not null default 0,
  category text not null default 'subscription',
  pay_method text not null default 'card',
  card_id uuid references public.cards(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  pay_day int not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. RLS 활성화 + 정책
alter table public.fixed_expenses enable row level security;

create policy "Users can manage own fixed_expenses" on public.fixed_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. updated_at 자동 갱신 트리거
create trigger fixed_expenses_updated_at before update on public.fixed_expenses
  for each row execute function public.handle_updated_at();
