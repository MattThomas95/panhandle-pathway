-- Admin-friendly RPCs for tracking updates and email payload
create or replace function set_order_tracking(p_order_id uuid, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_role text;
  v_owner uuid;
begin
  if v_requester is null then
    raise exception 'Unauthorized';
  end if;

  select role into v_role from profiles where id = v_requester;
  select user_id into v_owner from orders where id = p_order_id;

  if v_owner is null then
    raise exception 'Order not found';
  end if;

  if v_role <> 'admin' and v_owner <> v_requester then
    raise exception 'Forbidden';
  end if;

  update orders
    set shipping_tracking_number = p_tracking
    where id = p_order_id;
end;
$$;

grant execute on function set_order_tracking to authenticated;


-- Return order + items for email (admin/owner via SECURITY DEFINER)
create or replace function get_order_for_email(p_order_id uuid)
returns table(
  email text,
  full_name text,
  total numeric,
  shipping_address jsonb,
  tracking_number text,
  item_name text,
  item_qty int,
  item_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_role text;
  v_owner uuid;
begin
  if v_requester is null then
    raise exception 'Unauthorized';
  end if;

  select role into v_role from profiles where id = v_requester;
  select user_id into v_owner from orders where id = p_order_id;

  if v_owner is null then
    raise exception 'Order not found';
  end if;

  if v_role <> 'admin' and v_owner <> v_requester then
    raise exception 'Forbidden';
  end if;

  return query
  select
    prof.email,
    prof.full_name,
    o.total,
    o.shipping_address,
    o.shipping_tracking_number,
    prod.name,
    oi.quantity,
    coalesce(oi.price, prod.price, 0)
  from orders o
  join profiles prof on prof.id = o.user_id
  left join order_items oi on oi.order_id = o.id
  left join products prod on prod.id = oi.product_id
  where o.id = p_order_id;
end;
$$;

grant execute on function get_order_for_email to authenticated;
