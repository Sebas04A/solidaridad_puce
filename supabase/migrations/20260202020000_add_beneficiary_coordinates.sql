-- Add coordinates to beneficiaries table
ALTER TABLE public.beneficiarios 
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lng double precision;

-- Enable Row Level Security (RLS) if not already enabled (good practice, though likely already on)
-- ALTER TABLE public.beneficiarios ENABLE ROW LEVEL SECURITY;

-- Comment on columns
COMMENT ON COLUMN public.beneficiarios.lat IS 'Latitude coordinate for the beneficiary location';
COMMENT ON COLUMN public.beneficiarios.lng IS 'Longitude coordinate for the beneficiary location';

-- Add some dummy coordinates for existing beneficiaries if they exist (South Quito area approx)
-- This is just for demonstration purposes, usually we would not update data this way in prod without care
UPDATE public.beneficiarios SET lat = -0.2104, lng = -78.5126 WHERE nombre LIKE '%Pedro%'; -- San Pedro approx
UPDATE public.beneficiarios SET lat = -0.2299, lng = -78.5249 WHERE nombre LIKE '%Esperanza%'; -- La Esperanza approx
UPDATE public.beneficiarios SET lat = -0.2500, lng = -78.5400 WHERE nombre LIKE '%Carmen%'; -- El Carmen approx
