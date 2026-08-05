"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

export async function createTicketAction(input: z.infer<typeof createTicketSchema>, userId: string) {
  const data = createTicketSchema.parse(input);

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

  const { data: ticket, error } = await supabaseAdmin
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
    const { error: mediaError } = await supabaseAdmin.from("repair_ticket_media").insert(rows);
    if (mediaError) {
      console.error("[createTicketAction] media insert", mediaError);
    }
  }

  return { id: ticket.id, ticket_code: ticket.ticket_code };
}

export async function listMyTicketsAction(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("repair_tickets")
    .select("id, ticket_code, department, priority, status, building, floor, room, description, created_at, updated_at")
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketAction(id: string) {
  const { data: ticket, error } = await supabaseAdmin
    .from("repair_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!ticket) throw new Error("ไม่พบใบแจ้งซ่อม");

  const { data: media } = await supabaseAdmin
    .from("repair_ticket_media")
    .select("id, file_path, kind, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const signedMedia = await Promise.all(
    (media ?? []).map(async (m) => {
      const { data: signed } = await supabaseAdmin.storage
        .from("repair-media")
        .createSignedUrl(m.file_path, 60 * 60);
      return { ...m, url: signed?.signedUrl ?? null };
    }),
  );

  return { ticket, media: signedMedia };
}

export async function confirmTicketCompletedAction(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("repair_tickets")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("reporter_id", userId);

  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getMyProfileAction(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, email, person_code")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMyProfileAction(
  userId: string,
  input: { full_name: string; phone: string; person_code: string }
) {
  const parsed = z
    .object({
      full_name: z.string().trim().min(1).max(120),
      phone: z.string().trim().min(6).max(30),
      person_code: z.string().trim().min(1).max(50),
    })
    .parse(input);

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: parsed.full_name,
      phone: parsed.phone,
      person_code: parsed.person_code,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return { ok: true };
}
