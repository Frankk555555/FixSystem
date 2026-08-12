CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Select Policy: Users can view messages if they have access to the ticket
DROP POLICY IF EXISTS "Users can view ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can view ticket messages" 
ON public.ticket_messages FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_messages.ticket_id
      AND (
        (select auth.uid()) = t.reporter_id
        OR public.has_role((select auth.uid()), 'admin'::public.app_role)
        OR (t.department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
        OR (t.department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
        OR (t.department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
      )
  )
);

-- Insert Policy: Users can send messages if they have access to the ticket, and they must be the sender
DROP POLICY IF EXISTS "Users can send ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can send ticket messages" 
ON public.ticket_messages FOR INSERT 
TO authenticated
WITH CHECK (
  (select auth.uid()) = sender_id
  AND EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_id
      AND (
        (select auth.uid()) = t.reporter_id
        OR public.has_role((select auth.uid()), 'admin'::public.app_role)
        OR (t.department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
        OR (t.department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
        OR (t.department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
      )
  )
);

-- Enable Realtime for ticket_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ticket_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
  END IF;
END $$;
