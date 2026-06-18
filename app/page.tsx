import { getParticipants } from "@/lib/participants";
import { TeamGenerator } from "@/components/team-generator";

export const dynamic = "force-dynamic";

export default async function Home() {
  const participants = await getParticipants();
  return <TeamGenerator initialParticipants={participants} />;
}
