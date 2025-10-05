-- Create sensor_status table for Arduino integration
create table if not exists public.sensor_status (
  id integer primary key default 1,
  sensor_triggered boolean not null default false,
  last_triggered_at timestamptz,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Insert initial row
insert into public.sensor_status (id, sensor_triggered)
values (1, false)
on conflict (id) do nothing;

-- No RLS needed - this is a public sensor status table
-- Anyone can read, only backend can write
alter table public.sensor_status enable row level security;

create policy "Anyone can read sensor status"
  on public.sensor_status for select
  using (true);

create policy "Service role can update sensor status"
  on public.sensor_status for update
  using (true);

create policy "Service role can insert sensor status"
  on public.sensor_status for insert
  with check (true);
