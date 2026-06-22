"use client";

import { createChart, AreaSeries, type IChartApi, type Time } from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { ChartPoint } from "@/lib/types";

export function ChartCard({ data }: { data: ChartPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#111111" },
        textColor: "#cbbfae",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      crosshair: {
        vertLine: { color: "#ff7a00" },
        horzLine: { color: "#ff7a00" },
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#ff7a00",
      topColor: "rgba(255, 122, 0, 0.35)",
      bottomColor: "rgba(255, 122, 0, 0.02)",
      lineWidth: 3,
    });

    series.setData(data.map((point) => ({ time: point.time as Time, value: point.value })));
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) {
        return;
      }

      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: 320,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  return <div ref={containerRef} className="h-80 w-full" />;
}
