import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgCardProps {
  /** Small line above the title, e.g. the program name. */
  eyebrow: string;
  title: string;
  /** Up to three headline numbers. */
  stats: { value: string; label: string }[];
  /** Optional bars, oldest first, e.g. projects per year. */
  bars?: { label: string; value: number }[];
  /** Accent colour for bars and the rule. */
  accent?: string;
}

/**
 * Shared social preview card: graphite background, large title, real numbers and, where
 * available, a bar per year. Rendered at build time with next/og.
 */
export function ogCard({ eyebrow, title, stats, bars, accent = "#1ac66e" }: OgCardProps) {
  const max = Math.max(1, ...(bars ?? []).map((b) => b.value));
  const size = title.length > 34 ? 64 : title.length > 22 ? 76 : 92;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(160deg, #0b0c0e 0%, #050506 55%, #0a1410 100%)", color: "#f5f3ef", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f5f3ef", display: "flex", flexWrap: "wrap", padding: 9, gap: 4 }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: i === 1 ? accent : "#050506" }} />)}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>OSSGrid</div>
          </div>
          <div style={{ fontSize: 24, color: "#a3a7b0" }}>ossgrid.tech</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: accent, marginBottom: 14 }}>{eyebrow}</div>
          <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, maxWidth: 1040 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", gap: 56 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.5 }}>{s.value}</div>
                <div style={{ fontSize: 24, color: "#a3a7b0" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {bars && bars.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {bars.map((b) => (
                  <div key={b.label} style={{ width: Math.max(10, Math.min(30, 360 / bars.length)), height: b.value > 0 ? Math.max(8, (b.value / max) * 120) : 3, borderRadius: 3, background: b.value > 0 ? accent : "#2a2c31" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 10, fontSize: 20, color: "#80858f" }}>
                <span>{bars[0].label}</span>
                <span>{bars[bars.length - 1].label}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    OG_SIZE
  );
}
