-- Admin RPC for updating tracking number (callable by service role)
create or replace function admin_update_tracking(p_order_id uuid, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
    set shipping_tracking_number = p_tracking
    where id = p_order_id;
end;
$$;

-- Grant execute to service_role
grant execute on function admin_update_tracking to service_role;
