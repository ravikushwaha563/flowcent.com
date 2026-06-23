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
alter table public.clients add column if not exists whatsapp_opt_in boolean not null default false;

create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    client_id uuid not null references public.clients(id) on delete restrict,
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
alter table public.invoices add column if not exists followup_claim_token uuid;
alter table public.invoices add column if not exists followup_claimed_at timestamptz;
alter table public.invoices add column if not exists checkout_claim_token uuid;
alter table public.invoices add column if not exists checkout_claimed_at timestamptz;

do $$
begin
    if exists (select 1 from pg_constraint where conname = 'invoices_client_id_fkey' and conrelid = 'public.invoices'::regclass) then
        alter table public.invoices drop constraint invoices_client_id_fkey;
    end if;
    alter table public.invoices add constraint invoices_client_id_fkey
        foreign key (client_id) references public.clients(id) on delete restrict;
exception when duplicate_object then null;
end $$;

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

create unique index if not exists promises_manual_analysis_once
    on public.promises(invoice_id, email_id)
    where email_id like 'manual-analysis:%';

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
alter table public.followups add column if not exists provider_message_id text;

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
    processing_started_at timestamptz,
    attempt_count integer not null default 0,
    created_at timestamptz not null default now(),
    unique(provider, provider_event_id)
);

create table if not exists public.rate_limit_buckets (
    key text primary key,
    request_count integer not null default 0,
    window_started_at timestamptz not null default now(),
    expires_at timestamptz not null
);

alter table public.webhook_events add column if not exists processing_started_at timestamptz;
alter table public.webhook_events add column if not exists attempt_count integer not null default 0;

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_followup_due_idx on public.invoices(next_followup_date)
    where auto_followup = true and status = 'pending';
create unique index if not exists invoices_public_token_idx on public.invoices(public_token);
create unique index if not exists invoices_user_number_idx on public.invoices(user_id, lower(invoice_number));
create index if not exists promises_invoice_id_idx on public.promises(invoice_id);
create index if not exists followups_invoice_id_idx on public.followups(invoice_id);
create unique index if not exists followups_invoice_provider_message_id_idx on public.followups(invoice_id, provider_message_id)
    where provider_message_id is not null;
create index if not exists billing_orders_user_id_idx on public.billing_orders(user_id);
create index if not exists rate_limit_buckets_expires_at_idx on public.rate_limit_buckets(expires_at);
create index if not exists webhook_events_processed_at_idx on public.webhook_events(processed_at)
    where processed_at is not null;

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

revoke all on function public.activate_billing_order(text, text) from public, anon, authenticated;
grant execute on function public.activate_billing_order(text, text) to service_role;

create or replace function public.create_client_record(
    p_user_id uuid,
    p_name text,
    p_email text,
    p_phone text,
    p_company text,
    p_whatsapp_opt_in boolean
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
    target_user public.users%rowtype;
    active_plan text;
    client_count integer;
    new_id uuid;
begin
    select * into target_user from public.users where id = p_user_id for update;
    if not found then raise exception using errcode = 'P0001', message = 'USER_NOT_FOUND'; end if;

    active_plan := case
        when target_user.plan_expires_at is not null and target_user.plan_expires_at < now() then 'free'
        else coalesce(target_user.subscription_plan, 'free')
    end;
    select count(*) into client_count from public.clients where user_id = p_user_id;
    if active_plan = 'free' and client_count >= 3 then
        raise exception using errcode = 'P0001', message = 'CLIENT_LIMIT_EXCEEDED';
    end if;

    insert into public.clients (user_id, name, email, phone, company, whatsapp_opt_in)
    values (p_user_id, p_name, p_email, nullif(p_phone, ''), nullif(p_company, ''), coalesce(p_whatsapp_opt_in, false))
    returning id into new_id;
    return new_id;
end;
$$;

revoke all on function public.create_client_record(uuid, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.create_client_record(uuid, text, text, text, text, boolean) to service_role;

create or replace function public.create_invoice_record(
    p_user_id uuid,
    p_client_id uuid,
    p_invoice_number text,
    p_amount numeric,
    p_currency text,
    p_due_date date,
    p_auto_followup boolean,
    p_next_followup_date timestamptz
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
    target_user public.users%rowtype;
    active_plan text;
    invoice_count integer;
    new_id uuid;
begin
    update public.users
    set invoice_count_this_month = 0,
        ai_usage_this_month = 0,
        usage_reset_at = now(),
        updated_at = now()
    where id = p_user_id and usage_reset_at < date_trunc('month', now());

    select * into target_user from public.users where id = p_user_id for update;
    if not found then raise exception using errcode = 'P0001', message = 'USER_NOT_FOUND'; end if;
    if not exists (select 1 from public.clients where id = p_client_id and user_id = p_user_id) then
        raise exception using errcode = 'P0001', message = 'CLIENT_NOT_FOUND';
    end if;

    active_plan := case
        when target_user.plan_expires_at is not null and target_user.plan_expires_at < now() then 'free'
        else coalesce(target_user.subscription_plan, 'free')
    end;
    if active_plan = 'free' and coalesce(p_auto_followup, false) then
        raise exception using errcode = 'P0001', message = 'AUTOMATION_REQUIRES_PRO';
    end if;
    select count(*) into invoice_count from public.invoices
    where user_id = p_user_id and created_at >= date_trunc('month', now());
    if active_plan = 'free' and invoice_count >= 5 then
        raise exception using errcode = 'P0001', message = 'INVOICE_LIMIT_EXCEEDED';
    end if;

    insert into public.invoices (
        user_id, client_id, invoice_number, amount, currency, due_date,
        status, payment_intent_score, auto_followup, current_stage, next_followup_date
    ) values (
        p_user_id, p_client_id, p_invoice_number, p_amount, p_currency, p_due_date,
        'pending', 50, coalesce(p_auto_followup, false), 1, p_next_followup_date
    ) returning id into new_id;

    update public.users
    set invoice_count_this_month = invoice_count_this_month + 1,
        updated_at = now()
    where id = p_user_id;
    return new_id;
end;
$$;

revoke all on function public.create_invoice_record(uuid, uuid, text, numeric, text, date, boolean, timestamptz) from public, anon, authenticated;
grant execute on function public.create_invoice_record(uuid, uuid, text, numeric, text, date, boolean, timestamptz) to service_role;

create or replace function public.claim_webhook_event(
    p_provider text,
    p_event_id text,
    p_event_type text,
    p_payload jsonb
)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
    target_event public.webhook_events%rowtype;
begin
    insert into public.webhook_events (provider, provider_event_id, event_type, payload)
    values (p_provider, p_event_id, p_event_type, p_payload)
    on conflict (provider, provider_event_id) do nothing;

    select * into target_event from public.webhook_events
    where provider = p_provider and provider_event_id = p_event_id
    for update;

    if target_event.processed_at is not null then return 'processed'; end if;
    if target_event.processing_started_at is not null
       and target_event.processing_started_at > now() - interval '5 minutes' then
        return 'busy';
    end if;

    update public.webhook_events
    set processing_started_at = now(), attempt_count = attempt_count + 1, payload = p_payload
    where provider = p_provider and provider_event_id = p_event_id;
    return 'claimed';
end;
$$;

revoke all on function public.claim_webhook_event(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_webhook_event(text, text, text, jsonb) to service_role;

create or replace function public.claim_due_followup_invoices(p_limit integer default 50)
returns table(invoice_id uuid, claim_token uuid)
language plpgsql
security definer set search_path = public
as $$
begin
    return query
    with candidates as (
        select i.id
        from public.invoices i
        join public.users u on u.id = i.user_id
        where i.status = 'pending'
          and i.auto_followup = true
          and i.next_followup_date <= now()
          and i.current_stage between 1 and 5
          and (i.followup_claimed_at is null or i.followup_claimed_at < now() - interval '15 minutes')
          and coalesce(u.subscription_plan, 'free') <> 'free'
          and (u.plan_expires_at is null or u.plan_expires_at > now())
          and u.gmail_connected = true
          and u.gmail_refresh_token is not null
        order by i.next_followup_date asc
        for update of i skip locked
        limit greatest(1, least(coalesce(p_limit, 50), 100))
    ), claimed as (
        update public.invoices i
        set followup_claim_token = gen_random_uuid(), followup_claimed_at = now(), updated_at = now()
        from candidates c
        where i.id = c.id
        returning i.id, i.followup_claim_token
    )
    select claimed.id, claimed.followup_claim_token from claimed;
end;
$$;

revoke all on function public.claim_due_followup_invoices(integer) from public, anon, authenticated;
grant execute on function public.claim_due_followup_invoices(integer) to service_role;

create or replace function public.record_followup_delivery(
    p_invoice_id uuid,
    p_claim_token uuid,
    p_expected_stage integer,
    p_email_subject text,
    p_message_content text,
    p_channel text,
    p_provider_message_id text
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
    target_user_id uuid;
begin
    if p_expected_stage not between 1 and 5 then return false; end if;

    select user_id into target_user_id
    from public.invoices
    where id = p_invoice_id
      and followup_claim_token = p_claim_token
      and status = 'pending'
      and current_stage = p_expected_stage
    for update;
    if not found then return false; end if;

    insert into public.followups (
        invoice_id, user_id, stage, email_subject, message_content,
        channel, status, sent_at, provider_message_id
    ) values (
        p_invoice_id, target_user_id, p_expected_stage, p_email_subject, p_message_content,
        p_channel, 'sent', now(), p_provider_message_id
    );

    update public.invoices
    set current_stage = p_expected_stage + 1,
        next_followup_date = case when p_expected_stage >= 5 then null else now() + interval '3 days' end,
        auto_followup = p_expected_stage < 5,
        followup_claim_token = null,
        followup_claimed_at = null,
        updated_at = now()
    where id = p_invoice_id;

    return true;
end;
$$;

revoke all on function public.record_followup_delivery(uuid, uuid, integer, text, text, text, text) from public, anon, authenticated;
grant execute on function public.record_followup_delivery(uuid, uuid, integer, text, text, text, text) to service_role;

create or replace function public.consume_rate_limit(
    p_key text,
    p_limit integer,
    p_window_seconds integer
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
    bucket public.rate_limit_buckets%rowtype;
begin
    if length(p_key) <> 64 or p_limit < 1 or p_limit > 10000
       or p_window_seconds < 1 or p_window_seconds > 86400 then
        return false;
    end if;

    insert into public.rate_limit_buckets (key, request_count, window_started_at, expires_at)
    values (p_key, 0, now(), now() + make_interval(secs => p_window_seconds))
    on conflict (key) do nothing;

    select * into bucket from public.rate_limit_buckets where key = p_key for update;
    if bucket.expires_at <= now() then
        update public.rate_limit_buckets
        set request_count = 1,
            window_started_at = now(),
            expires_at = now() + make_interval(secs => p_window_seconds)
        where key = p_key;
        return true;
    end if;
    if bucket.request_count >= p_limit then return false; end if;

    update public.rate_limit_buckets
    set request_count = request_count + 1
    where key = p_key;
    return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

revoke all on public.users, public.clients, public.invoices, public.promises,
    public.followups, public.billing_orders, public.webhook_events, public.rate_limit_buckets from anon;

revoke all on public.users, public.clients, public.invoices, public.promises,
    public.followups, public.billing_orders, public.webhook_events, public.rate_limit_buckets from authenticated;

grant select (id, email, name, company_name, industry, gmail_connected, gmail_email,
    subscription_plan, plan_started_at, plan_expires_at, invoice_count_this_month,
    ai_usage_this_month, usage_reset_at, created_at, updated_at)
    on public.users to authenticated;
grant insert (id, email, name, password_hash, company_name, industry)
    on public.users to authenticated;
grant update (name, company_name, industry, updated_at)
    on public.users to authenticated;
grant select on public.clients, public.invoices, public.promises,
    public.followups, public.billing_orders to authenticated;

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.promises enable row level security;
alter table public.followups enable row level security;
alter table public.billing_orders enable row level security;
alter table public.webhook_events enable row level security;
alter table public.rate_limit_buckets enable row level security;

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

create or replace function public.consume_ai_analysis()
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
    target_user public.users%rowtype;
    active_plan text;
begin
    if auth.uid() is null then
        return false;
    end if;

    update public.users
    set ai_usage_this_month = 0,
        invoice_count_this_month = 0,
        usage_reset_at = now(),
        updated_at = now()
    where id = auth.uid()
      and usage_reset_at < date_trunc('month', now());

    select * into target_user from public.users where id = auth.uid() for update;
    if not found then
        return false;
    end if;

    active_plan := case
        when target_user.plan_expires_at is not null and target_user.plan_expires_at < now() then 'free'
        else coalesce(target_user.subscription_plan, 'free')
    end;

    if active_plan = 'free' and target_user.ai_usage_this_month >= 5 then
        return false;
    end if;

    update public.users
    set ai_usage_this_month = ai_usage_this_month + 1,
        updated_at = now()
    where id = auth.uid();
    return true;
end;
$$;

revoke all on function public.consume_ai_analysis() from public;
grant execute on function public.consume_ai_analysis() to authenticated;

commit;
