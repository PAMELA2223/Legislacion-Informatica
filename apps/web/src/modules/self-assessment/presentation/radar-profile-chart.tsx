"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { EJES, ETIQUETAS_EJE, type PerfilCompetencias } from "../domain/self-assessment.entity";

export function RadarProfileChart({
  inicial,
  final,
}: {
  inicial?: PerfilCompetencias | null;
  final?: PerfilCompetencias | null;
}) {
  // Recharts mide el tamaño del contenedor en el navegador (ResponsiveContainer),
  // lo que produce un HTML distinto entre servidor y cliente. Para evitar el
  // error de hidratación, el gráfico solo se dibuja tras montarse en el cliente;
  // mientras tanto se muestra un placeholder con las mismas dimensiones.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const data = EJES.map((eje) => ({
    eje: ETIQUETAS_EJE[eje],
    Inicial: inicial ? inicial[eje] : undefined,
    Final: final ? final[eje] : undefined,
  }));

  if (!montado) {
    return (
      <div className="w-full h-80 rounded-xl bg-background-secondary animate-pulse" />
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="eje" tick={{ fill: "#1E293B", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
          {inicial && (
            <Radar name="Diagnóstico inicial" dataKey="Inicial" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
          )}
          {final && (
            <Radar name="Diagnóstico final" dataKey="Final" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
          )}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
