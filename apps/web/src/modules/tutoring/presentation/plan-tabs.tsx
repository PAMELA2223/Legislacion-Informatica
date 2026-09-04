"use client";

import { useState } from "react";
import { ClipboardList, Target, Lock, CalendarClock, Link2 } from "lucide-react";
import { TaskList } from "./task-list";
import { ObjectiveList } from "./objective-list";
import { ObservationList } from "./observation-list";
import { MeetingList } from "./meeting-list";
import { ResourceList } from "./resource-list";
import type {
  TutoringMeeting,
  TutoringObjective,
  TutoringObservation,
  TutoringResource,
  TutoringTask,
} from "../domain/tutoring.entity";

interface PlanTabsProps {
  assignmentId: string;
  puedeEditar: boolean; // true para el docente tutor y el administrador
  puedeCompletarTareas: boolean; // true también para el estudiante
  tareas: TutoringTask[];
  objetivos: TutoringObjective[];
  observaciones: TutoringObservation[];
  reuniones: TutoringMeeting[];
  recursos: TutoringResource[];
}

const PESTANAS = [
  { id: "tareas", label: "Tareas", icon: ClipboardList },
  { id: "objetivos", label: "Objetivos", icon: Target },
  { id: "reuniones", label: "Reuniones", icon: CalendarClock },
  { id: "recursos", label: "Recursos", icon: Link2 },
  { id: "observaciones", label: "Observaciones", icon: Lock },
] as const;

export function PlanTabs(props: PlanTabsProps) {
  const [activa, setActiva] = useState<(typeof PESTANAS)[number]["id"]>("tareas");

  // Las observaciones son privadas del tutor: la pestaña ni siquiera se
  // muestra si quien mira esto no puede editar (es decir, si es el estudiante).
  const pestanas = props.puedeEditar ? PESTANAS : PESTANAS.filter((p) => p.id !== "observaciones");

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-border mb-6">
        {pestanas.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiva(p.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activa === p.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <p.icon className="w-4 h-4" />
            {p.label}
          </button>
        ))}
      </div>

      {activa === "tareas" && (
        <TaskList
          assignmentId={props.assignmentId}
          tareas={props.tareas}
          puedeCrear={props.puedeEditar}
          puedeCompletar={props.puedeCompletarTareas}
        />
      )}
      {activa === "objetivos" && (
        <ObjectiveList assignmentId={props.assignmentId} objetivos={props.objetivos} puedeEditar={props.puedeEditar} />
      )}
      {activa === "reuniones" && (
        <MeetingList assignmentId={props.assignmentId} reuniones={props.reuniones} puedeCrear={props.puedeEditar} />
      )}
      {activa === "recursos" && (
        <ResourceList assignmentId={props.assignmentId} recursos={props.recursos} puedeCrear={props.puedeEditar} />
      )}
      {activa === "observaciones" && props.puedeEditar && (
        <ObservationList assignmentId={props.assignmentId} observaciones={props.observaciones} />
      )}
    </div>
  );
}
