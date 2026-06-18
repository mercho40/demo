import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Participant = {
  id: string;
  name: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "participants.json");

async function readFile(): Promise<Participant[]> {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data as Participant[];
}

async function writeFile(participants: Participant[]): Promise<void> {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(participants, null, 2) + "\n",
    "utf-8",
  );
}

export async function getParticipants(): Promise<Participant[]> {
  return readFile();
}

export async function addParticipant(name: string): Promise<Participant> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("El nombre no puede estar vacío.");
  }

  const participants = await readFile();

  const exists = participants.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) {
    throw new Error("Ya existe un participante con ese nombre.");
  }

  const participant: Participant = { id: randomUUID(), name: trimmed };
  participants.push(participant);
  await writeFile(participants);
  return participant;
}

export async function removeParticipant(id: string): Promise<boolean> {
  const participants = await readFile();
  const next = participants.filter((p) => p.id !== id);
  if (next.length === participants.length) {
    return false;
  }
  await writeFile(next);
  return true;
}
