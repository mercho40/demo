import { NextResponse } from "next/server";
import { addParticipant, getParticipants } from "@/lib/participants";

export const dynamic = "force-dynamic";

export async function GET() {
  const participants = await getParticipants();
  return NextResponse.json(participants);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const name =
    typeof body === "object" && body !== null && "name" in body
      ? String((body as { name: unknown }).name ?? "")
      : "";

  try {
    const participant = await addParticipant(name);
    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo agregar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
