import { TeamClient } from "@/components/TeamClient";

// Server component: reads the optional DEFAULT_ENTRY_ID and hands it to the
// interactive client view.
export default function TeamPage() {
  const initialEntryId = process.env.DEFAULT_ENTRY_ID ?? "";
  return <TeamClient initialEntryId={initialEntryId} />;
}
