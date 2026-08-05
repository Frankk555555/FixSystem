import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_ticket_status",
  title: "Update ticket status",
  description:
    "Change a repair ticket's status. Allowed only where the signed-in user's permissions (technician/admin/owner) permit it.",
  inputSchema: {
    ticket_id: z.string().trim().describe("Ticket UUID."),
    status: z
      .enum(["pending", "assigned", "scheduled", "in_progress", "completed"])
      .describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ ticket_id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("repair_tickets")
      .update({ status })
      .eq("id", ticket_id)
      .select("id, ticket_code, status")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: "No ticket updated — not found or not permitted." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { ticket: data },
    };
  },
});
