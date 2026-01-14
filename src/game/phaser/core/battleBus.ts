// src/game/phaser/core/battleBus.ts
import type { BattleEvent, IBattleBus } from "./types";

export class BattleBus implements IBattleBus {
  private listeners = new Set<(evt: BattleEvent) => void>();

  emit(evt: BattleEvent): void {
    for (const fn of this.listeners) fn(evt);
  }

  subscribe(fn: (evt: BattleEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
