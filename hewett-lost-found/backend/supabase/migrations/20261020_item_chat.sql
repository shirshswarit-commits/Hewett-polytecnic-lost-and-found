create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_threads_distinct_users check (owner_id <> participant_id),
  constraint chat_threads_one_thread_per_item_participant unique (item_id, participant_id)
);

create index if not exists chat_threads_owner_updated_idx
  on public.chat_threads (owner_id, updated_at desc);

create index if not exists chat_threads_participant_updated_idx
  on public.chat_threads (participant_id, updated_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  location jsonb,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_or_location check (length(trim(body)) > 0 or location is not null),
  constraint chat_messages_body_limit check (length(body) <= 2000)
);

create index if not exists chat_messages_thread_created_idx
  on public.chat_messages (thread_id, created_at);

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

notify pgrst, 'reload schema';
