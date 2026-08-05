import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_ticket",
  title: "Get repair ticket",
  description: "Fetch one repair ticket by its id or ticket code (e.g. RPR-2025-00001).",
  inputSchema: {
    ticket: z.string().trim().describe("Ticket UUID or ticket code."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ ticket }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket);

    const { data, error } = await supabase
      .from("repair_tickets")
      .select("*")
      .eq(isUuid ? "id" : "ticket_code", ticket)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Ticket not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { ticket: data },
    };
  },
});
