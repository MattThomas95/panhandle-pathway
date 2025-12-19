-- Compute slot availability from bookings (pending/confirmed) ignoring stale booked_count
create or replace function get_time_slots_with_availability(p_service_id uuid default null)
returns table(
  id uuid,
  service_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  capacity integer,
  booked_count integer,
  is_available boolean
)
language sql
security definer
set search_path = public
as $$
  select
    ts.id,
    ts.service_id,
    ts.start_time,
    ts.end_time,
    ts.capacity,
    coalesce(b.booked, 0) as booked_count,
    coalesce(b.booked, 0) < ts.capacity as is_available
  from time_slots ts
  left join (
    select slot_id, count(*) as booked
    from bookings
    where status in ('confirmed','pending')
    group by slot_id
  ) b on b.slot_id = ts.id
  where p_service_id is null or ts.service_id = p_service_id;
$$;

grant execute on function get_time_slots_with_availability(uuid) to anon, authenticated;
