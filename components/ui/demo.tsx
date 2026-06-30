"use client";

import { HalftoneTrail } from "@/components/ui/halftone-trail";

export default function DemoOne() {
  return (
    <div className="relative w-full min-h-[600px] rounded-3xl overflow-hidden bg-background border border-border">
      <HalftoneTrail
        cellSize={10}
        color="var(--foreground)"
        decay={0.965}
        brushSize={0.045}
        hoverBrushSize={0.012}
        opacity={1.0}
        hoverOpacity={0.15}
        speedScale={38.0}
      />
    </div>
  );
}
