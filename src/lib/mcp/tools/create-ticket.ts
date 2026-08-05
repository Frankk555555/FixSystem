import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_ticket",
  title: "Create repair ticket",
  description: "Report a new campus repair issue as the signed-in user.",
  inputSchema: {
    department: z
      .enum(["electric", "plumbing", "general"])
      .describe("Repair department: electric, plumbing, or general (structural)."),
    priority: z.enum(["normal", "urgent", "critical"]).optional().describe("Urgency (default normal)."),
    building: z.string().trim().describe("Building name."),
    floor: z.string().trim().optional().describe("Floor."),
    room: z.string().trim().optional().describe("Room number."),
    location_note: z.string().trim().optional().describe("Extra location hint."),
    description: z.string().trim().describe("What is broken."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("repair_tickets")
      .insert({
        reporter_id: ctx.getUserId(),
        department: input.department,
        priority: input.priority ?? "normal",
        building: input.building,
        floor: input.floor ?? null,
        room: input.room ?? null,
        location_note: input.location_note ?? null,
        description: input.description,
      })
      .select("id, ticket_code, status")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { ticket: data },
    };
  },
});
