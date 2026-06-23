"use client";

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type ISeriesApi,
  type LineData,
  type Time,
} from "lightweight-charts";
import { BarChart3, CandlestickChart, LoaderCircle, Waves } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartCandle, ChartInterval } from "@/lib/types";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/utils";

const INTERVALS: ChartInterval[] = ["15m", "1H", "4H", "1D"];

type ChartMode = "area" | "candles";

function toTime(value: number) {
  return value as Time;
}

function formatAxisPrice(value: number) {
  if (value >= 1) {
    return value.toFixed(2);
  }

  if (value >= 0.01) {
    return value.toFixed(4);
  }

  return value.toFixed(6);
}

function createSimpleMovingAverage(data: ChartCandle[], period: number): LineData<Time>[] {
  return data.map((candle, index) => {
    if (index + 1 < period) {
      return { time: toTime(candle.time), value: candle.close };
    }

    const slice = data.slice(index + 1 - period, index + 1);
    const average = slice.reduce((sum, item) => sum + item.close, 0) / period;
    return { time: toTime(candle.time), value: average };
  });
}

function createExponentialMovingAverage(data: ChartCandle[], period: number): LineData<Time>[] {
  const multiplier = 2 / (period + 1);
  let previousEma = data[0]?.close ?? 0;

  return data.map((candle, index) => {
    if (index === 0) {
      previousEma = candle.close;
      return { time: toTime(candle.time), value: previousEma };
    }

    previousEma = (candle.close - previousEma) * multiplier + previousEma;
    return { time: toTime(candle.time), value: previousEma };
  });
}

export function ChartCard({
  address,
  data: initialData,
  symbol,
}: {
  address: string;
  data: ChartCandle[];
  symbol: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [interval, setInterval] = useState<ChartInterval>("1H");
  const [mode, setMode] = useState<ChartMode>("candles");
  const [showVolume, setShowVolume] = useState(true);
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(false);
  const [showEma20, setShowEma20] = useState(true);
  const [remoteChart, setRemoteChart] = useState<{
    address: string;
    interval: ChartInterval;
    data: ChartCandle[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChart() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/chart/${address}?interval=${interval}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load chart.");
        }

        const payload = (await response.json()) as { chart?: ChartCandle[] };
        if (!controller.signal.aborted && payload.chart?.length) {
          setRemoteChart({
            address,
            interval,
            data: payload.chart,
          });
        }
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Unable to load chart.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadChart();

    return () => {
      controller.abort();
    };
  }, [address, interval]);

  const data = useMemo(() => {
    if (remoteChart?.address === address && remoteChart.interval === interval && remoteChart.data.length) {
      return remoteChart.data;
    }

    return initialData;
  }, [address, initialData, interval, remoteChart]);

  const latestCandle = data[data.length - 1];
  const previousCandle = data[data.length - 2];
  const changePercent = useMemo(() => {
    if (!latestCandle || !previousCandle || previousCandle.close === 0) {
      return 0;
    }

    return ((latestCandle.close - previousCandle.close) / previousCandle.close) * 100;
  }, [latestCandle, previousCandle]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#111111" },
        textColor: "#ccb79e",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        vertLine: { color: "#ff7a00", labelBackgroundColor: "#ff7a00" },
        horzLine: { color: "#ff7a00", labelBackgroundColor: "#ff7a00" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        visible: true,
        minimumWidth: 88,
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        priceFormatter: formatAxisPrice,
      },
    });

    let primarySeries:
      | ISeriesApi<"Area", Time>
      | ISeriesApi<"Candlestick", Time>;

    if (mode === "candles") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#ff9a3c",
        downColor: "#f25d3d",
        borderVisible: false,
        wickUpColor: "#ffb562",
        wickDownColor: "#ff7c5c",
        priceLineColor: "#ff7a00",
        priceScaleId: "right",
        lastValueVisible: true,
      });

      candleSeries.setData(
        data.map(
          (candle): CandlestickData<Time> => ({
            time: toTime(candle.time),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }),
        ),
      );
      primarySeries = candleSeries;
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: "#ff7a00",
        topColor: "rgba(255, 122, 0, 0.35)",
        bottomColor: "rgba(255, 122, 0, 0.02)",
        lineWidth: 3,
        priceLineColor: "#ff7a00",
        priceScaleId: "right",
        lastValueVisible: true,
      });

      areaSeries.setData(
        data.map((candle) => ({
          time: toTime(candle.time),
          value: candle.close,
        })),
      );
      primarySeries = areaSeries;
    }

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: "#6a4a25",
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });

      volumeSeries.setData(
        data.map(
          (candle): HistogramData<Time> => ({
            time: toTime(candle.time),
            value: candle.volume,
            color: candle.close >= candle.open ? "rgba(255, 154, 60, 0.55)" : "rgba(242, 93, 61, 0.5)",
          }),
        ),
      );
    }

    const indicatorSeries: Array<ISeriesApi<"Line", Time>> = [];

    if (showSma20) {
      const series = chart.addSeries(LineSeries, {
        color: "#ffd166",
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      series.setData(createSimpleMovingAverage(data, 20));
      indicatorSeries.push(series);
    }

    if (showSma50) {
      const series = chart.addSeries(LineSeries, {
        color: "#7dd3fc",
        lineWidth: 2,
        lineStyle: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      series.setData(createSimpleMovingAverage(data, 50));
      indicatorSeries.push(series);
    }

    if (showEma20) {
      const series = chart.addSeries(LineSeries, {
        color: "#c084fc",
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      series.setData(createExponentialMovingAverage(data, 20));
      indicatorSeries.push(series);
    }

    chart.timeScale().fitContent();

    return () => {
      indicatorSeries.forEach((series) => chart.removeSeries(series));
      chart.removeSeries(primarySeries);
      chart.remove();
    };
  }, [data, mode, showEma20, showSma20, showSma50, showVolume]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-white/6 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-white/48">
              BirdEye live feed
            </div>
            <div className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/60">
              {symbol} on Solana
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setInterval(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  interval === value ? "bg-[#ff7a00] text-white" : "bg-white/6 text-white/68 hover:bg-white/10 hover:text-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("candles")}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === "candles" ? "bg-[#ff7a00] text-white" : "bg-white/6 text-white/68 hover:bg-white/10 hover:text-white"
            }`}
          >
            <CandlestickChart className="h-3.5 w-3.5" />
            Candles
          </button>
          <button
            type="button"
            onClick={() => setMode("area")}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === "area" ? "bg-[#ff7a00] text-white" : "bg-white/6 text-white/68 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            Area
          </button>
          <button
            type="button"
            onClick={() => setShowVolume((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              showVolume ? "bg-[#fff1dc] text-black" : "bg-white/6 text-white/68 hover:bg-white/10 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Volume
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: "SMA 20", enabled: showSma20, toggle: () => setShowSma20((value) => !value), activeClass: "bg-[#ffd166] text-black" },
          { label: "SMA 50", enabled: showSma50, toggle: () => setShowSma50((value) => !value), activeClass: "bg-[#7dd3fc] text-black" },
          { label: "EMA 20", enabled: showEma20, toggle: () => setShowEma20((value) => !value), activeClass: "bg-[#c084fc] text-black" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.toggle}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              item.enabled ? item.activeClass : "bg-white/6 text-white/68 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {[
          { label: "Last", value: latestCandle ? formatCurrency(latestCandle.close, 6) : "--" },
          { label: "Change", value: latestCandle ? formatPercent(changePercent) : "--", positive: changePercent >= 0 },
          { label: "High", value: latestCandle ? formatCurrency(latestCandle.high, 6) : "--" },
          { label: "Low", value: latestCandle ? formatCurrency(latestCandle.low, 6) : "--" },
          { label: "Volume", value: latestCandle ? formatCompactCurrency(latestCandle.volume) : "--" },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">{item.label}</p>
            <p className={`mt-2 text-base font-semibold ${item.label === "Change" ? (item.positive ? "text-[#8ef0bc]" : "text-[#ff998f]") : "text-white"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/20">
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-xs text-white/75 backdrop-blur">
          <span className="font-mono uppercase tracking-[0.22em] text-white/40">Last price</span>
          <span className="text-sm font-semibold text-white">
            {latestCandle ? formatCurrency(latestCandle.close, 6) : "--"}
          </span>
          <span className={changePercent >= 0 ? "font-semibold text-[#8ef0bc]" : "font-semibold text-[#ff998f]"}>
            {formatPercent(changePercent)}
          </span>
        </div>

        {loading ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 inline-flex w-fit items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white/72 backdrop-blur">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Refreshing chart
          </div>
        ) : null}

        {error ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 w-fit rounded-full bg-[#3a2119] px-3 py-1.5 text-xs text-[#ffc0b2]">
            {error}
          </div>
        ) : null}

        <div ref={containerRef} className="h-[420px] w-full" />
      </div>
    </div>
  );
}
