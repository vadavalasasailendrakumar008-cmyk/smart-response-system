-- =========================================================================
-- RescuOS Database Schema & Security Definition
-- Production PostgreSQL DDL for Supabase
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Definitions
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CITIZEN', 'RESPONDER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE emergency_category AS ENUM ('MEDICAL', 'ACCIDENT', 'FIRE', 'CRIME', 'DISASTER', 'MISSING', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM ('Reported', 'Under Review', 'Responder Assigned', 'Responder En Route', 'Assistance Arrived', 'Resolved', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Responders Profile Table
CREATE TABLE IF NOT EXISTS public.responders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    department TEXT NOT NULL, -- e.g. "Fire & Rescue", "Emergency Medical Services", "Police"
    badge_number TEXT NOT NULL UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Emergency Incidents Table
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category emergency_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'MEDIUM',
    ai_priority_reasoning TEXT,
    ai_suggested_guidance JSONB DEFAULT '[]'::jsonb,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address_text TEXT NOT NULL,
    is_location_verified BOOLEAN NOT NULL DEFAULT FALSE,
    affected_people_count INT DEFAULT 1,
    status incident_status NOT NULL DEFAULT 'Reported',
    assigned_responder_id UUID REFERENCES public.responders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- 4. Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
    status incident_status NOT NULL,
    changed_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Notifications Simulation Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-frequency triage queries
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.emergency_incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON public.emergency_incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON public.emergency_incidents(created_at DESC);

-- Realtime Publication Enablement
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_incidents;
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.status_history;
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_responder(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role IN ('RESPONDER', 'ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id OR is_responder(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Emergency Incidents Policies
DROP POLICY IF EXISTS "Citizens can insert own incidents" ON public.emergency_incidents;
CREATE POLICY "Citizens can insert own incidents" ON public.emergency_incidents 
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Citizens can view own reported incidents" ON public.emergency_incidents;
CREATE POLICY "Citizens can view own reported incidents" ON public.emergency_incidents 
  FOR SELECT USING (auth.uid() = reporter_id OR is_responder(auth.uid()));

DROP POLICY IF EXISTS "Responders and Admins can update incidents" ON public.emergency_incidents;
CREATE POLICY "Responders and Admins can update incidents" ON public.emergency_incidents 
  FOR UPDATE USING (is_responder(auth.uid()));

-- Status History Policies
DROP POLICY IF EXISTS "Users can view status history for readable incidents" ON public.status_history;
CREATE POLICY "Users can view status history for readable incidents" ON public.status_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.emergency_incidents i 
      WHERE i.id = status_history.incident_id 
      AND (i.reporter_id = auth.uid() OR is_responder(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Responders and Citizens can create status history logs" ON public.status_history;
CREATE POLICY "Responders and Citizens can create status history logs" ON public.status_history 
  FOR INSERT WITH CHECK (auth.uid() = changed_by_user_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = recipient_id);
