-- Add private logistics & proof-of-purchase fields to listings
ALTER TABLE "listings"
  ADD COLUMN IF NOT EXISTS "pickup_pincode" TEXT,
  ADD COLUMN IF NOT EXISTS "weight_kg" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "dimensions_cm" TEXT,
  ADD COLUMN IF NOT EXISTS "invoice_proof_url" TEXT;
