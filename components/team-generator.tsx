"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCheck,
  Copy,
  Plus,
  Shuffle,
  Square,
  Trash2,
  Users,
} from "lucide-react";

import type { Participant } from "@/lib/participants";
import { generateTeams, type Team } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TeamGenerator({
  initialParticipants,
}: {
  initialParticipants: Participant[];
}) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [present, setPresent] = useState<Set<string>>(
    () => new Set(initialParticipants.map((p) => p.id)),
  );
  const [perTeamInput, setPerTeamInput] = useState("4");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [teams, setTeams] = useState<Team[] | null>(null);

  const perTeam = Math.max(1, Number.parseInt(perTeamInput, 10) || 0);

  const presentParticipants = useMemo(
    () => participants.filter((p) => present.has(p.id)),
    [participants, present],
  );
  const presentCount = presentParticipants.length;
  const teamCount = presentCount > 0 ? Math.max(1, Math.floor(presentCount / perTeam)) : 0;

  function togglePresent(id: string) {
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setPresent(new Set(participants.map((p) => p.id)));
  }

  function selectNone() {
    setPresent(new Set());
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo agregar.");
      setParticipants((prev) => [...prev, data]);
      setPresent((prev) => new Set(prev).add(data.id));
      setNewName("");
      toast.success(`${data.name} agregado/a.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al agregar.",
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(participant: Participant) {
    try {
      const res = await fetch(`/api/participants/${participant.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo eliminar.");
      }
      setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      setPresent((prev) => {
        const next = new Set(prev);
        next.delete(participant.id);
        return next;
      });
      setTeams(null);
      toast.success(`${participant.name} eliminado/a.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar.",
      );
    }
  }

  function handleGenerate() {
    if (presentCount === 0) {
      toast.error("Marcá al menos un participante como presente.");
      return;
    }
    setTeams(generateTeams(presentParticipants, perTeam));
  }

  async function copyTeams() {
    if (!teams) return;
    const text = teams
      .map(
        (team) =>
          `${team.name}\n${team.members.map((m) => `  - ${m.name}`).join("\n")}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Equipos copiados al portapapeles.");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Users className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Generador de equipos
            </h1>
            <p className="text-sm text-muted-foreground">
              Hackathon Diseña · 4to y 5to
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Participantes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Participantes</CardTitle>
                <CardDescription>
                  {presentCount} presentes de {participants.length}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  title="Marcar todos"
                >
                  <CheckCheck className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectNone}
                  title="Desmarcar todos"
                >
                  <Square className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAdd} className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Agregar participante…"
                aria-label="Nombre del nuevo participante"
              />
              <Button type="submit" disabled={adding || !newName.trim()}>
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Agregar</span>
              </Button>
            </form>

            <Separator />

            <ScrollArea className="h-[28rem] pr-3">
              <ul className="space-y-1">
                {participants.length === 0 && (
                  <li className="py-8 text-center text-sm text-muted-foreground">
                    No hay participantes. Agregá uno arriba.
                  </li>
                )}
                {participants.map((participant) => {
                  const checked = present.has(participant.id);
                  return (
                    <li
                      key={participant.id}
                      className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60"
                    >
                      <Checkbox
                        id={`p-${participant.id}`}
                        checked={checked}
                        onCheckedChange={() => togglePresent(participant.id)}
                      />
                      <Label
                        htmlFor={`p-${participant.id}`}
                        className={`flex-1 cursor-pointer text-sm font-normal ${
                          checked ? "" : "text-muted-foreground line-through"
                        }`}
                      >
                        {participant.name}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                        onClick={() => handleRemove(participant)}
                        title={`Eliminar a ${participant.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Configuración + resultados */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Armar equipos</CardTitle>
              <CardDescription>
                Definí cuántas personas querés por equipo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="per-team">Personas por equipo</Label>
                  <Input
                    id="per-team"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={perTeamInput}
                    onChange={(e) => setPerTeamInput(e.target.value)}
                    className="w-32"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleGenerate}
                  className="sm:ml-auto"
                  disabled={presentCount === 0}
                >
                  <Shuffle className="size-4" />
                  {teams ? "Volver a sortear" : "Generar equipos"}
                </Button>
              </div>
              {presentCount > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Se armarán{" "}
                  <span className="font-medium text-foreground">
                    {teamCount}
                  </span>{" "}
                  equipos de ~{Math.floor(presentCount / teamCount)}–
                  {Math.ceil(presentCount / teamCount)} personas con los{" "}
                  <span className="font-medium text-foreground">
                    {presentCount}
                  </span>{" "}
                  presentes.
                </p>
              )}
            </CardContent>
          </Card>

          {teams && teams.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Resultado{" "}
                  <Badge variant="secondary">{teams.length} equipos</Badge>
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyTeams}
                >
                  <Copy className="size-4" />
                  Copiar
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {teams.map((team) => (
                  <Card key={team.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        {team.name}
                        <Badge variant="outline">
                          {team.members.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5 text-sm">
                        {team.members.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center gap-2"
                          >
                            <span className="size-1.5 rounded-full bg-primary/60" />
                            {member.name}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
