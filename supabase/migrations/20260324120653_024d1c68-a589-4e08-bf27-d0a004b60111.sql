DELETE FROM public.vendors v
WHERE v.status = 'pending'
  AND v.id NOT IN (
    SELECT DISTINCT vendor_id FROM public.profiles WHERE vendor_id IS NOT NULL
  )
  AND v.id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM public.vendors
    WHERE status = 'pending'
      AND id NOT IN (SELECT DISTINCT vendor_id FROM public.profiles WHERE vendor_id IS NOT NULL)
    ORDER BY email, created_at DESC
  );