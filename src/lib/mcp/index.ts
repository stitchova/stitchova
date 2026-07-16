import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listNotesTool from "./tools/list-notes";
import createNoteTool from "./tools/create-note";
import deleteNoteTool from "./tools/delete-note";

// Direct supabase.co issuer, built from the project ref inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "stitchova-mcp",
  title: "Stitchova",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in Stitchova user. Use `whoami` to confirm the session, `list_notes` to read notes, `create_note` to add one, and `delete_note` to remove one by id.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listNotesTool, createNoteTool, deleteNoteTool],
});