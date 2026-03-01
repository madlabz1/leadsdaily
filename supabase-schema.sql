-- Run this in Supabase SQL editor to create the schema

-- Users table
create table public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  business_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  plan_tier text default 'free',
  created_at timestamptz default now()
);

-- ICP profiles
create table public.icp_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  description text not null,
  generated_queries jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Delivery emails
create table public.delivery_emails (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  email_address text not null,
  verified boolean default false,
  verification_token text,
  created_at timestamptz default now()
);

-- Leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  icp_profile_id uuid references public.icp_profiles(id) on delete cascade not null,
  company_name text not null,
  company_url text not null,
  description text,
  signals jsonb default '{}'::jsonb,
  relevance_score integer default 0,
  source_query text,
  delivered_at timestamptz,
  feedback text check (feedback in ('good', 'bad')),
  created_at timestamptz default now()
);

-- Search runs
create table public.search_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  icp_profile_id uuid references public.icp_profiles(id) on delete cascade not null,
  executed_at timestamptz default now(),
  query_count integer default 0,
  result_count integer default 0,
  status text check (status in ('success', 'failed')) default 'success'
);

-- Indexes
create index idx_icp_profiles_user on public.icp_profiles(user_id);
create index idx_delivery_emails_user on public.delivery_emails(user_id);
create index idx_leads_user on public.leads(user_id);
create index idx_leads_delivered on public.leads(delivered_at);
create index idx_leads_company_url on public.leads(company_url);
create index idx_search_runs_user on public.search_runs(user_id);

-- Enable RLS
alter table public.users enable row level security;
alter table public.icp_profiles enable row level security;
alter table public.delivery_emails enable row level security;
alter table public.leads enable row level security;
alter table public.search_runs enable row level security;

-- RLS policies (service role bypasses these, used for direct client access)
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create policy "Users can manage own ICP profiles" on public.icp_profiles for all using (auth.uid() = user_id);
create policy "Users can manage own delivery emails" on public.delivery_emails for all using (auth.uid() = user_id);
create policy "Users can read own leads" on public.leads for select using (auth.uid() = user_id);
create policy "Users can update own leads" on public.leads for update using (auth.uid() = user_id);
create policy "Users can read own search runs" on public.search_runs for select using (auth.uid() = user_id);
