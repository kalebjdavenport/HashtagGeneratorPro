"use client";

import dynamic from "next/dynamic";

const ArchitectureDiagram = dynamic(
  () => import("@/components/ArchitectureDiagram"),
  { ssr: false },
);

export default function ArchitectureDiagramClient() {
  return <ArchitectureDiagram />;
}