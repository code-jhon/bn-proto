import { useCallback, useEffect, useMemo, useState } from "react";
import type { BattleEvent, Chip, HPData, IBattleBus } from "../game/phaser/core/types";

type Props = { bus: IBattleBus };

const CHIP_HOTKEYS = ["J", "K", "L"] as const;

export function BattleHUD({ bus }: Props) {
  const [gauge, setGauge] = useState(0);
  const [hand, setHand] = useState<Chip[] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [playerHP, setPlayerHP] = useState<HPData>({ current: 200, max: 200 });
  const [enemyHP, setEnemyHP] = useState<HPData>({ current: 200, max: 200 });

  const selectChip = useCallback((chip: Chip) => {
    bus.emit({ type: "CHIP_SELECTED", chip });
  }, [bus]);

  useEffect(() => {
    return bus.subscribe((evt: BattleEvent) => {
      if (evt.type === "GAUGE_CHANGED") setGauge(evt.value);
      if (evt.type === "CHIP_MENU_OPENED") setHand(evt.chips);
      if (evt.type === "LOG") setLogs((prev) => [evt.message, ...prev].slice(0, 6));
      if (evt.type === "CHIP_SELECTED") setHand(null);
      if (evt.type === "HP_CHANGED") {
        setPlayerHP(evt.player);
        setEnemyHP(evt.enemy);
      }
    });
  }, [bus]);

  // Keyboard shortcuts for chip selection (J, K, L)
  useEffect(() => {
    if (!hand) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const index = CHIP_HOTKEYS.indexOf(key as typeof CHIP_HOTKEYS[number]);
      if (index !== -1 && hand[index]) {
        selectChip(hand[index]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hand, selectChip]);

  const gaugePct = useMemo(() => Math.round(gauge * 100), [gauge]);
  const playerHPPct = useMemo(() => Math.round((playerHP.current / playerHP.max) * 100), [playerHP]);
  const enemyHPPct = useMemo(() => Math.round((enemyHP.current / enemyHP.max) * 100), [enemyHP]);

  // Panel expands when player presses Z (chip menu opens)
  const isChipMenuOpen = hand !== null;
  const panelHeight = isChipMenuOpen ? 480 : 80;

  return (
    <div style={styles.root}>
      {/* Left Panel - Gauge & Chips */}
      <div style={{...styles.panel, ...styles.panelContainer, height: panelHeight}}>
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
              {hand.map((c, index) => (
                <button
                  key={c.id}
                  style={styles.chipBtn}
                  onClick={() => selectChip(c)}
                >
                  <div style={styles.chipHeader}>
                    <span style={styles.chipHotkey}>{CHIP_HOTKEYS[index]}</span>
                    <i className={c.icon} style={styles.chipIcon}></i>
                    <div style={styles.chipName}>{c.name}</div>
                  </div>
                  <div style={styles.chipDesc}>{c.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{...styles.logs, display: "none"}}>
          {isChipMenuOpen && logs.map((l, i) => (
            <div key={i} style={styles.logLine}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* HP Status Bars - Top Right */}
      <div style={styles.hpContainer}>
        <div style={styles.hpPanel}>
          <div style={styles.hpRow}>
            <div style={styles.hpLabel}>PLAYER</div>
            <div style={styles.hpValue}>{playerHP.current}/{playerHP.max}</div>
          </div>
          <div style={styles.hpBarOuter}>
            <div style={{ ...styles.hpBarInnerPlayer, width: `${playerHPPct}%` }} />
          </div>
        </div>
        <div style={styles.hpPanel}>
          <div style={styles.hpRow}>
            <div style={styles.hpLabel}>ENEMY</div>
            <div style={styles.hpValue}>{enemyHP.current}/{enemyHP.max}</div>
          </div>
          <div style={styles.hpBarOuter}>
            <div style={{ ...styles.hpBarInnerEnemy, width: `${enemyHPPct}%` }} />
          </div>
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
    justifyContent: "space-between",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  hpContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignSelf: "flex-start",
  },
  hpPanel: {
    width: 200,
    pointerEvents: "auto",
    background: "rgba(2, 6, 23, 0.85)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 10,
    padding: 10,
    color: "#e2e8f0",
  },
  hpRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  hpValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#e2e8f0",
  },
  hpBarOuter: {
    height: 8,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.18)",
    overflow: "hidden",
  },
  hpBarInnerPlayer: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #22c55e, #4ade80)",
    transition: "width 0.3s ease-out",
  },
  hpBarInnerEnemy: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ef4444, #f87171)",
    transition: "width 0.3s ease-out",
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
  panelContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    transition: "height 0.3s ease-in-out",
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
  chipHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  chipHotkey: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    borderRadius: 4,
    background: "rgba(96, 165, 250, 0.2)",
    border: "1px solid rgba(96, 165, 250, 0.4)",
    color: "#60a5fa",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "monospace",
  },
  chipIcon: {
    fontSize: 16,
    color: "#60a5fa",
    width: 20,
    textAlign: "center",
  },
  chipName: { fontWeight: 600, fontSize: 14 },
  chipDesc: { fontSize: 12, color: "#94a3b8", marginTop: 4, marginLeft: 28 },

  logs: { marginTop: 12, borderTop: "1px solid rgba(148,163,184,0.16)", paddingTop: 8 },
  logLine: { fontSize: 12, color: "#cbd5e1", marginTop: 4 },
};
