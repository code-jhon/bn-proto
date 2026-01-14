import type { Cell, Team, Vec2 } from "./types";

export type GridConfig = {
  origin: Vec2;      // top-left del tablero completo
  cellSize: number;  // px
  colsPerSide: number; // 3
  rows: number;      // 3
  gap: number;       // separación entre lados
};

export function clampCell(c: Cell, cfg: GridConfig): Cell {
  return {
    col: Math.max(0, Math.min(cfg.colsPerSide - 1, c.col)),
    row: Math.max(0, Math.min(cfg.rows - 1, c.row)),
  };
}

export function cellToWorld(team: Team, cell: Cell, cfg: GridConfig): Vec2 {
  const leftX = cfg.origin.x;
  const rightX = cfg.origin.x + cfg.colsPerSide * cfg.cellSize + cfg.gap;

  const baseX = team === "PLAYER" ? leftX : rightX;
  return {
    x: baseX + cell.col * cfg.cellSize + cfg.cellSize / 2,
    y: cfg.origin.y + cell.row * cfg.cellSize + cfg.cellSize / 2,
  };
}

export function isPlayerSide(team: Team): boolean {
  return team === "PLAYER";
}
