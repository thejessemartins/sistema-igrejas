"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createEventTrip, createVehicle } from "@/server/actions/transport";

interface Props {
  vehicles: Array<{
    id: string;
    name: string;
    plateText: string | null;
    capacity: number;
    kind: string;
  }>;
  trips: Array<{
    id: string;
    eventTitle: string;
    vehicleName: string;
    vehicleCapacity: number;
    driverText: string | null;
    departureAt: Date;
    departurePlaceText: string;
    status: string;
  }>;
  events: Array<{ id: string; title: string }>;
  canManage: boolean;
}

export function TransporteClient({
  vehicles,
  trips,
  events,
  canManage,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [vName, setVName] = useState("");
  const [vPlate, setVPlate] = useState("");
  const [vCap, setVCap] = useState("15");
  const [vKind, setVKind] = useState<"onibus" | "van" | "carro" | "outro">(
    "van"
  );
  const [tEventId, setTEventId] = useState(events[0]?.id ?? "");
  const [tVehicleId, setTVehicleId] = useState(vehicles[0]?.id ?? "");
  const [tDriver, setTDriver] = useState("");
  const [tPlace, setTPlace] = useState("Sede da Igreja");
  const [tDate, setTDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  function handleVehicle(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createVehicle({
        name: vName,
        plateText: vPlate,
        capacity: Number(vCap),
        kind: vKind,
      });
      setVName("");
      setVPlate("");
      router.refresh();
    });
  }

  function handleTrip(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createEventTrip({
        eventId: tEventId,
        vehicleId: tVehicleId,
        driverText: tDriver,
        departureAt: tDate,
        departurePlaceText: tPlace,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            onSubmit={handleVehicle}
            className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Cadastrar Veículo
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="Nome (ex: Van 01)"
                required
                className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
              />
              <input
                type="text"
                value={vPlate}
                onChange={(e) => setVPlate(e.target.value)}
                placeholder="Placa"
                className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
              />
              <input
                type="number"
                min={1}
                value={vCap}
                onChange={(e) => setVCap(e.target.value)}
                placeholder="Capacidade"
                required
                className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
              />
              <select
                value={vKind}
                onChange={(e) => setVKind(e.target.value as typeof vKind)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                <option value="van">Van</option>
                <option value="onibus">Ônibus</option>
                <option value="carro">Carro</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-8 items-center gap-1 rounded-[2px] bg-neutral-900 px-3 text-xs font-bold uppercase text-neutral-0"
            >
              <Plus className="h-3.5 w-3.5" /> Salvar Veículo
            </button>
          </form>

          {vehicles.length > 0 && events.length > 0 && (
            <form
              onSubmit={handleTrip}
              className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Nova Viagem
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  value={tEventId}
                  onChange={(e) => setTEventId(e.target.value)}
                  className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <select
                  value={tVehicleId}
                  onChange={(e) => setTVehicleId(e.target.value)}
                  className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity} lug.)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={tDriver}
                  onChange={(e) => setTDriver(e.target.value)}
                  placeholder="Motorista"
                  className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
                <input
                  type="text"
                  value={tPlace}
                  onChange={(e) => setTPlace(e.target.value)}
                  placeholder="Local de saída"
                  required
                  className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={tDate}
                  onChange={(e) => setTDate(e.target.value)}
                  required
                  className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm sm:col-span-2"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-8 items-center gap-1 rounded-[2px] bg-neutral-900 px-3 text-xs font-bold uppercase text-neutral-0"
              >
                <Plus className="h-3.5 w-3.5" /> Criar Viagem
              </button>
            </form>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Evento</th>
              <th className="px-4 py-2">Veículo</th>
              <th className="px-4 py-2">Motorista</th>
              <th className="px-4 py-2">Saída</th>
              <th className="px-4 py-2 text-right">Passageiros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {trips.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2 font-medium">{t.eventTitle}</td>
                <td className="px-4 py-2">
                  {t.vehicleName} ({t.vehicleCapacity} lug.)
                </td>
                <td className="px-4 py-2 text-neutral-600">
                  {t.driverText ?? "—"}
                </td>
                <td className="px-4 py-2 text-xs">
                  {new Date(t.departureAt).toLocaleString("pt-BR")} ·{" "}
                  {t.departurePlaceText}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/transporte/viagens/${t.id}`}
                    className="inline-flex h-7 items-center rounded-[2px] bg-neutral-900 px-2.5 text-[11px] font-bold uppercase text-neutral-0"
                  >
                    Gerenciar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
