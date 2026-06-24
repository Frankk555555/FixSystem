import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const departmentEnum = z.enum(["electric", "plumbing", "general"]);
const priorityEnum = z.enum(["normal", "urgent", "critical"]);

const createTicketSchema = z.object({
  department: departmentEnum,
  priority: priorityEnum,
  building: z.string().trim().min(1).max(120),
  floor: z.string().trim().max(40).optional().nullable(),
  room: z.string().trim().max(40).optional().nullable(),
  location_note: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().min(5, "อธิบายอาการอย่างน้อย 5 ตัวอักษร").max(2000),
  media_paths: z.array(z.string().max(500)).max(10).optional().default([]),
});

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createTicketSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const insertPayload = {
      reporter_id: userId,
      department: data.department,
      priority: data.priority,
      building: data.building,
      floor: data.floor || null,
      room: data.room || null,
      location_note: data.location_note || null,
      description: data.description,
    } as never;

    const { data: ticket, error } = await supabase
      .from("repair_tickets")
      .insert(insertPayload)
      .select("id, ticket_code")
      .single();

    if (error || !ticket) {
      throw new Error(error?.message || "ไม่สามารถสร้างใบแจ้งซ่อมได้");
    }

    if (data.media_paths && data.media_paths.length > 0) {
      const rows = data.media_paths.map((file_path) => ({
        ticket_id: ticket.id,
        file_path,
        kind: file_path.match(/\.(mp4|mov|webm)$/i) ? "video" : "image",
      }));
      const { error: mediaError } = await supabase.from("repair_ticket_media").insert(rows);
      if (mediaError) {
        console.error("[createTicket] media insert", mediaError);
      }
    }

    return { id: ticket.id, ticket_code: ticket.ticket_code };
  });

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("repair_tickets")
      .select("id, ticket_code, department, priority, status, building, floor, room, description, created_at, updated_at")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: ticket, error } = await supabase
      .from("repair_tickets")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ticket) throw new Error("ไม่พบใบแจ้งซ่อม");

    const { data: media } = await supabase
      .from("repair_ticket_media")
      .select("id, file_path, kind, created_at")
      .eq("ticket_id", data.id)
      .order("created_at", { ascending: true });

    const signedMedia = await Promise.all(
      (media ?? []).map(async (m) => {
        const { data: signed } = await supabase.storage
          .from("repair-media")
          .createSignedUrl(m.file_path, 60 * 60);
        return { ...m, url: signed?.signedUrl ?? null };
      }),
    );

    return { ticket, media: signedMedia };
  });

export const confirmTicketCompleted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("repair_tickets")
      .update({ status: "completed" })
      .eq("id", data.id)
      .eq("reporter_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, email, person_code")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(1).max(120),
        phone: z.string().trim().min(6).max(30),
        person_code: z.string().trim().min(1).max(50),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        person_code: data.person_code,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
