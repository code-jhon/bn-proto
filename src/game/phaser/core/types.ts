// src/game/phaser/core/types.ts
export type Team = "PLAYER" | "ENEMY";

export type Cell = { col: number; row: number };

export type Vec2 = { x: number; y: number };

export type ChipId = "CANNON" | "SWORD" | "GUARD";

export type Chip = {
  id: ChipId;
  name: string;
  description: string;
  // Efecto simple para el prototipo
  power?: number;
};

export type BattleEvent =
  | { type: "GAUGE_CHANGED"; value: number }
  | { type: "CHIP_MENU_OPENED"; chips: Chip[] }
  | { type: "CHIP_SELECTED"; chip: Chip }
  | { type: "LOG"; message: string };

export interface IBattleBus {
  emit(evt: BattleEvent): void;
  subscribe(fn: (evt: BattleEvent) => void): () => void;
}
