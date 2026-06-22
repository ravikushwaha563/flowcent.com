begin;

create extension if not exists pgcrypto;

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    name text,
    password_hash text not null default 'supabase_auth_managed',
    company_name text,
    industry text,
    gmail_connected boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.users add column if not exists subscription_plan text not null default 'free';
alter table public.users add column if not exists plan_started_at timestamptz;
alter table public.users add column if not exists plan_expires_at timestamptz;
alter table public.users add column if not exists invoice_count_this_month integer not null default 0;
alter table public.users add column if not exists ai_usage_this_month integer not null default 0;
alter table public.users add column if not exists usage_reset_at timestamptz not null default now();
alter table public.users add column if not exists gmail_access_token text;
alter table public.users add column if not exists gmail_refresh_token text;
alter table public.users add column if not exists gmail_token_expiry timestamptz;
alter table public.users add column if not exists gmail_email text;

create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    email text not null,
    phone text,
    company text,
    payment_history_score integer not null default 50,
    avg_payment_delay integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.clients add column if not exists ai_trust_score integer;
alter table public.clients add column if not exists ai_risk_level text;
alter table public.clients add column if not exists ai_trust_summary text;
alter table public.clients add column if not exists ai_scored_at timestamptz;

create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    client_id uuid not null references public.clients(id) on delete cascade,
    invoice_number text not null,
    amount numeric(12,2) not null,
    currency text not null default 'INR',
    due_date date not null,
    status text not null default 'pending',
    payment_intent_score integer not null default 50,
    file_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    paid_at timestamptz
);

alter table public.invoices add column if not exists public_token uuid not null default gen_random_uuid();
alter table public.invoices add column if not exists auto_followup boolean not null default false;
alter table public.invoices add column if not exists current_stage integer not null default 1;
alter table public.invoices add column if not exists next_followup_date timestamptz;
alter table public.invoices add column if not exists razorpay_order_id text;
alter table public.invoices add column if not exists razorpay_payment_id text;
alter table public.invoices add column if not exists stripe_session_id text;
alter table public.invoices add column if not exists stripe_payment_id text;
alter table public.invoices add column if not exists payment_gateway text;

create table if not exists public.promises (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    promise_text text not null,
    promise_type text not null,
    promised_date date,
    fulfilled boolean not null default false,
    email_id text,
    created_at timestamptz not null default now()
);

create table if not exists public.followups (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    stage integer not null,
    email_subject text,
    message_content text not null,
    channel text not null default 'email',
    status text not null default 'sent',
    sent_at timestamptz not null default now(),
    opened_at timestamptz,
    replied_at timestamptz
);

alter table public.followups add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.followups add column if not exists email_subject text;
alter table public.followups add column if not exists status text not null default 'sent';
alter table public.followups add column if not exists message_content text;
alter table public.followups add column if not exists channel text not null default 'email';

update public.followups f
set user_id = i.user_id
from public.invoices i
where f.invoice_id = i.id and f.user_id is null;
alter table public.followups alter column user_id set not null;

create table if not exists public.billing_orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    razorpay_order_id text not null unique,
    razorpay_payment_id text unique,
    plan text not null,
    billing_cycle text not null,
    amount integer not null,
    currency text not null default 'INR',
    status text not null default 'created',
    created_at timestamptz not null default now(),
    paid_at timestamptz
);

create table if not exists public.webhook_events (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    provider_event_id text not null,
    event_type text not null,
    payload jsonb not null,
    processed_at timestamptz,
    created_at timestamptz not null default now(),
    unique(provider, provider_event_id)
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_followup_due_idx on public.invoices(next_followup_date)
    where auto_followup = true and status = 'pending';
create unique index if not exists invoices_public_token_idx on public.invoices(public_token);
create index if not exists promises_invoice_id_idx on public.promises(invoice_id);
create index if not exists followups_invoice_id_idx on public.followups(invoice_id);
create index if not exists billing_orders_user_id_idx on public.billing_orders(user_id);

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'users_subscription_plan_check') then
        alter table public.users add constraint users_subscription_plan_check check (subscription_plan in ('free', 'pro', 'agency'));
    end if;
    if not exists (select 1 from pg_constraint where conname = 'users_usage_nonnegative_check') then
        alter table public.users add constraint users_usage_nonnegative_check check (invoice_count_this_month >= 0 and ai_usage_this_month >= 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'clients_scores_check') then
        alter table public.clients add constraint clients_scores_check check (payment_history_score between 0 and 100 and avg_payment_delay >= 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'invoices_amount_check') then
        alter table public.invoices add constraint invoices_amount_check check (amount > 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'invoices_currency_check') then
        alter table public.invoices add constraint invoices_currency_check check (currency in ('INR', 'USD', 'EUR', 'GBP'));
    end if;
    if not exists (select 1 from pg_constraint where conname = 'invoices_status_check') then
        alter table public.invoices add constraint invoices_status_check check (status in ('pending', 'paid', 'cancelled'));
    end if;
    if not exists (select 1 from pg_constraint where conname = 'invoices_intent_stage_check') then
        alter table public.invoices add constraint invoices_intent_stage_check check (payment_intent_score between 0 and 100 and current_stage between 1 and 6);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'followups_stage_status_check') then
        alter table public.followups add constraint followups_stage_status_check check (stage between 1 and 5 and status in ('queued', 'sent', 'failed'));
    end if;
    if not exists (select 1 from pg_constraint where conname = 'billing_orders_values_check') then
        alter table public.billing_orders add constraint billing_orders_values_check check (
            plan in ('pro', 'agency') and billing_cycle in ('monthly', 'annual')
            and amount > 0 and currency = 'INR' and status in ('created', 'paid', 'failed')
        );
    end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute procedure public.set_updated_at();
drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
for each row execute procedure public.set_updated_at();
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute procedure public.set_updated_at();

create or replace function public.activate_billing_order(p_order_id text, p_payment_id text)
returns table(plan text, expires_at timestamptz, already_processed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
    billing_order public.billing_orders%rowtype;
    current_expiry timestamptz;
    activation_start timestamptz;
    new_expiry timestamptz;
begin
    select * into billing_order
    from public.billing_orders
    where razorpay_order_id = p_order_id
    for update;

    if not found then raise exception 'Billing order not found'; end if;
    if auth.role() <> 'service_role' and billing_order.user_id <> auth.uid() then
        raise exception 'Not authorized for this billing order';
    end if;

    select plan_expires_at into current_expiry
    from public.users
    where id = billing_order.user_id
    for update;

    if billing_order.status = 'paid' then
        return query select billing_order.plan, current_expiry, true;
        return;
    end if;
    if billing_order.status <> 'created' then raise exception 'Billing order cannot be activated'; end if;

    activation_start := greatest(now(), coalesce(current_expiry, now()));
    new_expiry := activation_start + case
        when billing_order.billing_cycle = 'annual' then interval '12 months'
        else interval '1 month'
    end;

    update public.users set
        subscription_plan = billing_order.plan,
        plan_started_at = now(),
        plan_expires_at = new_expiry,
        updated_at = now()
    where id = billing_order.user_id;

    update public.billing_orders set
        status = 'paid',
        razorpay_payment_id = p_payment_id,
        paid_at = now()
    where id = billing_order.id;

    return query select billing_order.plan, new_expiry, false;
end;
$$;

revoke all on function public.activate_billing_order(text, text) from public, anon;
grant execute on function public.activate_billing_order(text, text) to authenticated, service_role;

revoke all on public.users, public.clients, public.invoices, public.promises,
    public.followups, public.billing_orders, public.webhook_events from anon;

grant select, insert, update, delete on public.users, public.clients, public.invoices,
    public.promises, public.followups, public.billing_orders to authenticated;

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.promises enable row level security;
alter table public.followups enable row level security;
alter table public.billing_orders enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users for select to authenticated using (id = auth.uid());
drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users for insert to authenticated with check (id = auth.uid());
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists clients_own_rows on public.clients;
create policy clients_own_rows on public.clients for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists invoices_own_rows on public.invoices;
create policy invoices_own_rows on public.invoices for all to authenticated
    using (user_id = auth.uid()) with check (
        user_id = auth.uid()
        and exists (select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid())
    );

drop policy if exists promises_own_rows on public.promises;
create policy promises_own_rows on public.promises for all to authenticated
    using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()))
    with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));

drop policy if exists followups_own_rows on public.followups;
create policy followups_own_rows on public.followups for all to authenticated
    using (user_id = auth.uid())
    with check (
        user_id = auth.uid()
        and exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
    );

drop policy if exists billing_orders_own_rows on public.billing_orders;
create policy billing_orders_own_rows on public.billing_orders for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Webhook events are service-role only.
drop policy if exists webhook_events_no_user_access on public.webhook_events;
create policy webhook_events_no_user_access on public.webhook_events for all to authenticated using (false) with check (false);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, email, name, company_name, password_hash)
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
        new.raw_user_meta_data ->> 'company_name',
        'supabase_auth_managed'
    )
    on conflict (id) do update set
        email = excluded.email,
        name = coalesce(public.users.name, excluded.name),
        updated_at = now();
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert or update of email, raw_user_meta_data on auth.users
    for each row execute procedure public.handle_new_user();

commit;
