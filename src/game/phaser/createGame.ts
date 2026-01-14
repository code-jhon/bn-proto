import Phaser from "phaser";
import { BattleScene } from "./scenes/BattleScene";
import type { IBattleBus } from "./core/types";

export function createGame(container: HTMLDivElement, bus: IBattleBus) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: 900,
    height: 520,
    backgroundColor: "#0b1220",
    physics: { default: "arcade" },
    scene: [new BattleScene(bus)],
  });

  return game;
}
