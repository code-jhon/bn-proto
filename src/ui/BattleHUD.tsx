import { useEffect, useMemo, useState } from "react";
import type { BattleEvent, Chip, IBattleBus } from "../game/phaser/core/types";

type Props = { bus: IBattleBus };

export function BattleHUD({ bus }: Props) {
  const [gauge, setGauge] = useState(0);
  const [hand, setHand] = useState<Chip[] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    return bus.subscribe((evt: BattleEvent) => {
      if (evt.type === "GAUGE_CHANGED") setGauge(evt.value);
      if (evt.type === "CHIP_MENU_OPENED") setHand(evt.chips);
      if (evt.type === "LOG") setLogs((prev) => [evt.message, ...prev].slice(0, 6));
      if (evt.type === "CHIP_SELECTED") setHand(null);
    });
  }, [bus]);

  const gaugePct = useMemo(() => Math.round(gauge * 100), [gauge]);

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <div style={styles.row}>
          <div style={styles.label}>Custom Gauge</div>
          <div style={styles.value}>{gaugePct}%</div>
        </div>
        <div style={styles.barOuter}>
          <div style={{ ...styles.barInner, width: `${gaugePct}%` }} />
        </div>

        {hand && (
          <div style={styles.menu}>
            <div style={styles.menuTitle}>Select a Chip</div>
            <div style={styles.chips}>
              {hand.map((c) => (
                <button
                  key={c.id}
                  style={styles.chipBtn}
                  onClick={() => bus.emit({ type: "CHIP_SELECTED", chip: c })}
                >
                  <div style={styles.chipName}>{c.name}</div>
                  <div style={styles.chipDesc}>{c.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.logs}>
          {logs.map((l, i) => (
            <div key={i} style={styles.logLine}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    display: "flex",
    justifyContent: "flex-end",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  panel: {
    width: 320,
    pointerEvents: "auto",
    background: "rgba(2, 6, 23, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 14,
    padding: 12,
    color: "#e2e8f0",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, color: "#94a3b8" },
  value: { fontSize: 12, color: "#e2e8f0" },
  barOuter: {
    marginTop: 8,
    height: 10,
    borderRadius: 999,
    background: "rgba(148,163,184,0.18)",
    overflow: "hidden",
  },
  barInner: { height: "100%", borderRadius: 999, background: "rgba(96,165,250,0.9)" },

  menu: { marginTop: 12 },
  menuTitle: { fontSize: 13, marginBottom: 8 },
  chips: { display: "grid", gap: 8 },
  chipBtn: {
    textAlign: "left",
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 12,
    padding: 10,
    cursor: "pointer",
    color: "inherit",
  },
  chipName: { fontWeight: 600, fontSize: 14 },
  chipDesc: { fontSize: 12, color: "#94a3b8", marginTop: 2 },

  logs: { marginTop: 12, borderTop: "1px solid rgba(148,163,184,0.16)", paddingTop: 8 },
  logLine: { fontSize: 12, color: "#cbd5e1", marginTop: 4 },
};
