import type { LandedCost } from '@/lib/types';

export function TrendBadge({ score }: { score: number }) {
  if (score < 25) return null;
  const label = score >= 45 ? '急上昇' : '伸びている';
  return (
    <span className="rounded-full bg-rose-soft px-2 py-0.5 text-[11px] font-semibold text-rose-deep">
      ↗ {label}
    </span>
  );
}

export function DutyBadge({ landedCost }: { landedCost: LandedCost }) {
  if (landedCost.dutyFree) {
    return (
      <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-mint-deep">
        税金なし
      </span>
    );
  }
  return (
    <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-semibold text-sun-deep">
      課税対象
    </span>
  );
}

export function SpreadBadge({ spreadJpy }: { spreadJpy: number }) {
  if (spreadJpy < 500) return null;
  return (
    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
      最大 ¥{Math.round(spreadJpy).toLocaleString('ja-JP')} 差
    </span>
  );
}
