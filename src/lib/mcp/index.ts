import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyTickets from "./tools/list-my-tickets";
import getTicket from "./tools/get-ticket";
import createTicket from "./tools/create-ticket";
import updateTicketStatus from "./tools/update-ticket-status";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "campus-fix-hub-71",
  title: "Campus Fix Hub (71)",
  version: "0.1.0",
  instructions:
    "Tools for the university online repair system. Use `create_ticket` to report a broken item, `list_my_tickets` and `get_ticket` to track progress, and `update_ticket_status` when the signed-in account is a technician or admin.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyTickets, getTicket, createTicket, updateTicketStatus],
});
