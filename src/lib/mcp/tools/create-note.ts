import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function db(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_note",
  title: "Create note",
  description: "Create a new note for the signed-in Stitchova user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Short title for the note."),
    content: z.string().optional().describe("Optional body text."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await db(ctx)
      .from("notes")
      .insert({ user_id: ctx.getUserId(), title, content: content ?? "" })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created note ${data.id}` }],
      structuredContent: { note: data },
    };
  },
});