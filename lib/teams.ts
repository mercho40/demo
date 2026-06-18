import type { Participant } from "./participants";

export type Team = {
  name: string;
  members: Participant[];
};

/** Fisher-Yates shuffle. Returns a new array, does not mutate the input. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Reparte a los participantes en equipos apuntando a `perTeam` personas por
 * equipo. La cantidad de equipos es floor(total / perTeam) y el resto se
 * distribuye para que ningún equipo quede mucho más chico: los tamaños difieren
 * a lo sumo en 1 (equipos de `perTeam` o `perTeam + 1`).
 */
export function generateTeams(
  participants: Participant[],
  perTeam: number,
): Team[] {
  const total = participants.length;
  if (total === 0 || perTeam < 1) return [];

  const teamCount = Math.max(1, Math.floor(total / perTeam));
  const base = Math.floor(total / teamCount);
  const remainder = total % teamCount;

  const shuffled = shuffle(participants);
  const teams: Team[] = [];
  let cursor = 0;

  for (let i = 0; i < teamCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    teams.push({
      name: `Equipo ${i + 1}`,
      members: shuffled.slice(cursor, cursor + size),
    });
    cursor += size;
  }

  return teams;
}
