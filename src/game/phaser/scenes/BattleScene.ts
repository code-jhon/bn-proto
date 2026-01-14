import Phaser from "phaser";
import type { Cell, Chip, IBattleBus, Team } from "../core/types";
import { cellToWorld, type GridConfig } from "../core/grid";
import { drawRandomChips } from "../core/chipSystem";

type Actor = {
  team: Team;
  cell: Cell;
  sprite: Phaser.GameObjects.Rectangle;
  hp: number;
  maxHp: number;
};

export class BattleScene extends Phaser.Scene {
  private bus: IBattleBus;
  private cfg: GridConfig = {
    origin: { x: 140, y: 130 },
    cellSize: 72,
    colsPerSide: 3,
    rows: 3,
    gap: 110,
  };

  private player!: Actor;
  private enemy!: Actor;

  private gauge = 0; // 0..1
  private gaugeRatePerSec = 0.18;
  private chipMenuOpen = false;
  private currentHand: Chip[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyZ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;

  constructor(bus: IBattleBus) {
    super("BattleScene");
    this.bus = bus;
  }

  create(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.drawBoard();

    this.player = this.spawnActor("PLAYER", { col: 1, row: 1 }, 200, 200, 0x4ade80);
    this.enemy = this.spawnActor("ENEMY", { col: 1, row: 1 }, 200, 200, 0xf87171);

    this.bus.emit({ type: "GAUGE_CHANGED", value: this.gauge });
    this.emitHPChanged();

    // UI -> Game: escuchar selección de chip (se emite desde React)
    this.bus.subscribe((evt) => {
      if (evt.type === "CHIP_SELECTED") this.executeChip(evt.chip);
    });
  }

  override update(_: number, dtMs: number): void {
    const dt = dtMs / 1000;

    if (!this.chipMenuOpen) {
      this.gauge = Math.min(1, this.gauge + this.gaugeRatePerSec * dt);
      this.bus.emit({ type: "GAUGE_CHANGED", value: this.gauge });

      this.handleMovement();

      // Abrir menú cuando gauge esté lleno y presiones Z
      if (this.gauge >= 1 && Phaser.Input.Keyboard.JustDown(this.keyZ)) {
        this.openChipMenu();
      }

      // Acción rápida: disparar Cannon con X (solo para debug)
      if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
        this.fireCannon();
      }
    }
  }

  private drawBoard(): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0x334155, 1);

    const drawSide = (x0: number) => {
      for (let r = 0; r < this.cfg.rows; r++) {
        for (let c = 0; c < this.cfg.colsPerSide; c++) {
          g.strokeRect(
            x0 + c * this.cfg.cellSize,
            this.cfg.origin.y + r * this.cfg.cellSize,
            this.cfg.cellSize,
            this.cfg.cellSize
          );
        }
      }
    };

    drawSide(this.cfg.origin.x);
    drawSide(this.cfg.origin.x + this.cfg.colsPerSide * this.cfg.cellSize + this.cfg.gap);

    const canvasHeight = this.scale.height;
    this.add.text(140, canvasHeight - 60, "BattleNetwork Web Prototype", { fontSize: "20px", color: "#e2e8f0" });
    this.add.text(140, canvasHeight - 36, "Arrows: move | Z: chip menu when gauge full | X: cannon", {
      fontSize: "14px",
      color: "#94a3b8",
    });
  }

  private spawnActor(team: Team, cell: Cell, hp: number, maxHp: number, color: number): Actor {
    const p = cellToWorld(team, cell, this.cfg);
    const sprite = this.add.rectangle(p.x, p.y, 44, 44, color).setOrigin(0.5);
    return { team, cell, sprite, hp, maxHp };
  }

  private moveActor(actor: Actor, next: Cell): void {
    actor.cell = next;
    const p = cellToWorld(actor.team, actor.cell, this.cfg);
    actor.sprite.setPosition(p.x, p.y);
  }

  private handleMovement(): void {
    // Solo movimiento 1 celda por keypress
    const justLeft = Phaser.Input.Keyboard.JustDown(this.cursors.left!);
    const justRight = Phaser.Input.Keyboard.JustDown(this.cursors.right!);
    const justUp = Phaser.Input.Keyboard.JustDown(this.cursors.up!);
    const justDown = Phaser.Input.Keyboard.JustDown(this.cursors.down!);

    if (!justLeft && !justRight && !justUp && !justDown) return;

    const delta = { col: 0, row: 0 };
    if (justLeft) delta.col = -1;
    if (justRight) delta.col = 1;
    if (justUp) delta.row = -1;
    if (justDown) delta.row = 1;

    const next: Cell = {
      col: Phaser.Math.Clamp(this.player.cell.col + delta.col, 0, this.cfg.colsPerSide - 1),
      row: Phaser.Math.Clamp(this.player.cell.row + delta.row, 0, this.cfg.rows - 1),
    };

    this.moveActor(this.player, next);
  }

  private openChipMenu(): void {
    this.chipMenuOpen = true;
    this.currentHand = drawRandomChips(3);
    this.bus.emit({ type: "CHIP_MENU_OPENED", chips: this.currentHand });
  }

  private closeChipMenu(consumeGauge: boolean): void {
    this.chipMenuOpen = false;
    if (consumeGauge) {
      this.gauge = 0;
      this.bus.emit({ type: "GAUGE_CHANGED", value: this.gauge });
    }
  }

  private executeChip(chip: Chip): void {
    // solo permitir si el menú está abierto
    if (!this.chipMenuOpen) return;

    if (chip.id === "CANNON") this.fireCannon();
    // TODO: Sword/Guard en siguientes iteraciones

    this.bus.emit({ type: "LOG", message: `Used ${chip.name}` });
    this.closeChipMenu(true);
  }

  private fireCannon(): void {
    const start = this.player.sprite.getCenter();
    const end = this.enemy.sprite.getCenter();

    // Proyectil simple línea recta
    const bullet = this.add.circle(start.x, start.y, 8, 0x60a5fa);
    this.tweens.add({
      targets: bullet,
      x: end.x,
      y: end.y,
      duration: 260,
      onComplete: () => {
        bullet.destroy();
        this.damageEnemy(40);
      },
    });
  }

  private damageEnemy(amount: number): void {
    this.enemy.hp = Math.max(0, this.enemy.hp - amount);
    this.bus.emit({ type: "LOG", message: `Enemy HP: ${this.enemy.hp}` });
    this.emitHPChanged();

    // feedback
    this.tweens.add({
      targets: this.enemy.sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      duration: 80,
    });
  }

  private emitHPChanged(): void {
    this.bus.emit({
      type: "HP_CHANGED",
      player: { current: this.player.hp, max: this.player.maxHp },
      enemy: { current: this.enemy.hp, max: this.enemy.maxHp },
    });
  }
}
