export function SkeletonRow({ cols = 4 }) {
  const widths = ["40%", "55%", "30%", "15%"];
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-ink-100 dark:border-ink-800/60">
          <div className="skel h-3.5 rounded" style={{ width: widths[i % widths.length] }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-2.5 p-5" aria-hidden="true">
      <div className="skel h-3 w-20 rounded" />
      <div className="skel h-7 w-14 rounded" />
      <div className="skel h-2.5 w-28 rounded" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-in space-y-px" aria-hidden="true">
      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="skel w-14 h-14 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skel h-4 w-36 rounded" />
            <div className="skel h-3 w-48 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          {[70, 55, 45, 60].map((w, i) => (
            <div key={i} className="skel h-3 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-5 animate-in" aria-hidden="true">
      {[1,2,3,4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="skel h-2.5 w-16 rounded" />
          <div className="skel h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
