import { NextResponse } from "next/server";
import { removeParticipant } from "@/lib/participants";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = await removeParticipant(id);
  if (!removed) {
    return NextResponse.json(
      { error: "Participante no encontrado." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
