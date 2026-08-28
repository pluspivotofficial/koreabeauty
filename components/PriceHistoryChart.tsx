'use client';

import { useMemo, useRef, useState } from 'react';
import type { HistoryPoint } from '@/lib/priceHistory';

/**
 * 最安総額の推移（1系列の折れ線）。
 *
 * 系列が1本なので凡例は置かず、見出しが何のグラフかを示す。直接ラベルは
 * 「今」と「期間中の最安」だけに絞り、残りの値はホバー／フォーカスの
 * ツールチップと、下の表で読めるようにしている。
 */

// 全体のサイズは viewBox 基準。幅は親に合わせて伸縮する。
const VB_W = 720;
const VB_H = 240;
const PAD = { top: 18, right: 84, bottom: 30, left: 58 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

const RANGES = [
  { label: '30日', days: 30 },
  { label: '90日', days: 90 },
];

function niceTicks(min: number, max: number, count = 3): number[] {
  const span = Math.max(max - min, 1);
  const rawStep = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max; v += step) ticks.push(Math.round(v));
  return ticks;
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export function PriceHistoryChart({
  points,
  shopNames,
}: {
  points: HistoryPoint[];
  /** shopId → 表示名。ツールチップでどのショップが最安だったかを出す。 */
  shopNames: Record<string, string>;
}) {
  const [days, setDays] = useState(RANGES[RANGES.length - 1].days);
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => points.slice(-days), [points, days]);

  const { xOf, yOf, path, areaPath, ticks, lowIndex, min, max } = useMemo(() => {
    const totals = data.map((p) => p.totalJpy);
    const rawMin = Math.min(...totals);
    const rawMax = Math.max(...totals);
    // 上下に少し余白を取り、線が枠に貼り付かないようにする
    const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.02);
    const lo = Math.max(0, rawMin - pad);
    const hi = rawMax + pad;

    const x = (i: number) => PAD.left + (data.length <= 1 ? PLOT_W / 2 : (i / (data.length - 1)) * PLOT_W);
    const y = (v: number) => PAD.top + PLOT_H - ((v - lo) / (hi - lo || 1)) * PLOT_H;

    const line = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.totalJpy).toFixed(1)}`).join(' ');
    const area = `${line} L${x(data.length - 1).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} L${x(0).toFixed(1)},${(
      PAD.top + PLOT_H
    ).toFixed(1)} Z`;

    return {
      xOf: x,
      yOf: y,
      path: line,
      areaPath: area,
      ticks: niceTicks(lo, hi),
      lowIndex: totals.indexOf(rawMin),
      min: rawMin,
      max: rawMax,
    };
  }, [data]);

  const lastIndex = data.length - 1;
  const current = data[lastIndex];
  const activePoint = active === null ? null : data[active];

  /** ポインタの位置から、いちばん近い日付の点を選ぶ（線を狙わせない）。 */
  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vbX = ((event.clientX - rect.left) / rect.width) * VB_W;
    const ratio = (vbX - PAD.left) / PLOT_W;
    const index = Math.round(ratio * (data.length - 1));
    setActive(Math.min(data.length - 1, Math.max(0, index)));
  }

  function handleKey(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const base = active ?? lastIndex;
    const next = event.key === 'ArrowLeft' ? base - 1 : base + 1;
    setActive(Math.min(data.length - 1, Math.max(0, next)));
  }

  return (
    <figure className="m-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <figcaption className="text-sm font-semibold">
          最安総額の推移
          <span className="ml-2 text-xs font-normal text-muted">送料・税込み／直近{data.length}日</span>
        </figcaption>
        <div className="flex gap-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => {
                setDays(range.days);
                setActive(null);
              }}
              aria-pressed={days === range.days}
              className={`rounded-full px-3 py-1 text-xs transition ${
                days === range.days ? 'bg-ink font-semibold text-white' : 'border border-line bg-white text-muted hover:border-rose'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full touch-none"
          role="img"
          aria-label={`最安総額の推移。直近${data.length}日で、最安 ${min.toLocaleString('ja-JP')}円、最高 ${max.toLocaleString(
            'ja-JP',
          )}円。現在は ${current.totalJpy.toLocaleString('ja-JP')}円。`}
          tabIndex={0}
          onPointerMove={handlePointer}
          onPointerLeave={() => setActive(null)}
          onKeyDown={handleKey}
          onFocus={() => setActive((a) => a ?? lastIndex)}
          onBlur={() => setActive(null)}
        >
          {/* 目盛り線は1pxの実線で、データより後ろに退かせる */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + PLOT_W}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 10}
                y={yOf(tick) + 4}
                textAnchor="end"
                className="tabular fill-[var(--color-muted)] text-[11px]"
              >
                {tick.toLocaleString('ja-JP')}
              </text>
            </g>
          ))}

          {/* 面は線と同じ色を薄く敷くだけ。塗りつぶしにはしない。 */}
          <path d={areaPath} fill="var(--color-rose-deep)" fillOpacity={0.1} />
          <path
            d={path}
            fill="none"
            stroke="var(--color-rose-deep)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 期間中の最安を1点だけ印付ける。
              いまの値が最安と同額なら、右端のラベルと同じ数字が二重に出るので描かない。 */}
          {data[lowIndex].totalJpy !== current.totalJpy && (
            <g>
              <circle
                cx={xOf(lowIndex)}
                cy={yOf(data[lowIndex].totalJpy)}
                r={4}
                fill="var(--color-rose-deep)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={xOf(lowIndex)}
                y={yOf(data[lowIndex].totalJpy) + 20}
                textAnchor="middle"
                className="tabular fill-[var(--color-muted)] text-[11px]"
              >
                期間最安 ¥{min.toLocaleString('ja-JP')}
              </text>
            </g>
          )}

          {/* 十字線。ポインタは日付を狙えばよく、線を狙う必要はない。 */}
          {active !== null && (
            <line
              x1={xOf(active)}
              x2={xOf(active)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="var(--color-muted)"
              strokeWidth={1}
            />
          )}
          {activePoint && (
            <circle
              cx={xOf(active!)}
              cy={yOf(activePoint.totalJpy)}
              r={4.5}
              fill="var(--color-rose-deep)"
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}

          {/* いまの値だけは常に直接ラベルを出す */}
          <circle
            cx={xOf(lastIndex)}
            cy={yOf(current.totalJpy)}
            r={4.5}
            fill="var(--color-rose-deep)"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <text
            x={xOf(lastIndex) + 12}
            y={yOf(current.totalJpy) + 4}
            className="tabular fill-[var(--color-ink)] text-[13px] font-semibold"
          >
            ¥{current.totalJpy.toLocaleString('ja-JP')}
          </text>

          <text x={PAD.left} y={VB_H - 8} className="fill-[var(--color-muted)] text-[11px]">
            {formatDate(data[0].date)}
          </text>
          <text x={PAD.left + PLOT_W} y={VB_H - 8} textAnchor="end" className="fill-[var(--color-muted)] text-[11px]">
            {formatDate(current.date)}
          </text>
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-line bg-white px-3 py-2 shadow-sm"
            style={{ left: `${((xOf(active!) / VB_W) * 100).toFixed(2)}%` }}
          >
            <p className="tabular text-sm leading-tight font-bold whitespace-nowrap">
              ¥{activePoint.totalJpy.toLocaleString('ja-JP')}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] whitespace-nowrap text-muted">
              <span aria-hidden className="inline-block h-0.5 w-3 rounded bg-[var(--color-rose-deep)]" />
              {formatDate(activePoint.date)}・{shopNames[activePoint.shopId] ?? activePoint.shopId}
            </p>
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-ink">数値を表で見る</summary>
        <div className="scroll-x mt-2 max-h-64 overflow-y-auto rounded-xl border border-line">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-line text-left text-muted">
                <th scope="col" className="px-3 py-2 font-medium">日付</th>
                <th scope="col" className="px-3 py-2 font-medium">最安総額</th>
                <th scope="col" className="px-3 py-2 font-medium">ショップ</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((point) => (
                <tr key={point.date} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-1.5">{point.date}</td>
                  <td className="tabular px-3 py-1.5">¥{point.totalJpy.toLocaleString('ja-JP')}</td>
                  <td className="px-3 py-1.5 text-muted">{shopNames[point.shopId] ?? point.shopId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
