-- Add 'estudiante' to the rol_usuario enum type
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'estudiante';

-- Note: The check constraint 'perfiles_rol_check' likely doesn't exist if the column uses an ENUM type directly.
-- However, just in case there was any legacy check or standard check added by Supabase UI on top of it:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'perfiles_rol_check'
    ) THEN
        ALTER TABLE public.perfiles DROP CONSTRAINT perfiles_rol_check;
        ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_rol_check 
        CHECK (rol IN ('admin', 'operador', 'voluntario', 'auditor', 'estudiante'));
    END IF;
END $$;
