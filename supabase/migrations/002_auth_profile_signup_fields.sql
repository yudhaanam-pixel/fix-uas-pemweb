CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    employee_code,
    phone,
    nik,
    gender,
    birth_date,
    address
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pasien'::public.user_role,
    NULL,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'nik',
    NULLIF(NEW.raw_user_meta_data->>'gender', '')::public.gender_type,
    NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::date,
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$;
