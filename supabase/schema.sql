create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  employee_code text not null unique,
  branch text not null default 'India' check (branch in ('India', 'UAE')),
  designation text,
  department text,
  location text,
  city text,
  group_name text,
  pan_number text,
  aadhaar_number text,
  joining_date date,
  company_name text,
  company_address text,
  bank_name text,
  account_number text,
  ifsc_code text,
  pf_account_number text,
  uan_number text,
  esic_account_number text,
  branch_office text,
  tax_regime text,
  earnings jsonb not null default '[]'::jsonb,
  deductions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_name, branch)
);

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  employee_name text not null,
  employee_code text,
  branch text not null check (branch in ('India', 'UAE')),
  month_year text not null,
  total_working_days numeric(10,2),
  lop numeric(10,2),
  arrears_days numeric(10,2),
  gross_salary numeric(12,2) not null default 0,
  total_deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (employee_code, month_year)
);

create index if not exists employees_branch_name_idx on public.employees(branch, employee_name);
create index if not exists payslips_employee_month_idx on public.payslips(employee_code, month_year desc);
create index if not exists payslips_payload_idx on public.payslips using gin (payload);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

alter table public.employees enable row level security;
alter table public.payslips enable row level security;

drop policy if exists "Allow all employees access" on public.employees;
create policy "Allow all employees access"
on public.employees
for all
using (true)
with check (true);

drop policy if exists "Allow all payslips access" on public.payslips;
create policy "Allow all payslips access"
on public.payslips
for all
using (true)
with check (true);

alter table public.employees
  alter column employee_code set not null;

drop index if exists payslips_employee_month_idx;
create index if not exists payslips_employee_month_idx on public.payslips(employee_code, month_year desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'employees_employee_code_key'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_employee_code_key unique (employee_code);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payslips_employee_code_month_year_key'
      and conrelid = 'public.payslips'::regclass
  ) then
    alter table public.payslips
      add constraint payslips_employee_code_month_year_key unique (employee_code, month_year);
  end if;
end $$;
