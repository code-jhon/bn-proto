# BN Web Prototype

A web-based battle system prototype inspired by **Mega Man Battle Network**, built with **React 19**, **Phaser 3**, and **Bun**.

## Overview

This project implements the core mechanics of a Battle Network-style combat system:
- Grid-based movement on a 3x3 per-side battlefield
- Custom Gauge system for chip selection timing
- Battle Chip system with random chip draws
- HP status bars for player and enemy with animated health tracking
- Dynamic UI panel that expands when gauge is full
- Event-driven communication between React UI and Phaser game engine

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Bun](https://bun.sh) | Runtime, bundler, and dev server |
| [React 19](https://react.dev) | UI layer (HUD, chip menus) |
| [Phaser 3](https://phaser.io) | Game engine (rendering, input, physics) |
| [TypeScript](https://www.typescriptlang.org) | Type safety throughout |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3.6 or later

### Installation

```bash
bun install
```

### Development

```bash
bun dev
```

The development server starts with hot module reloading enabled at `http://localhost:3000`.

### Production

```bash
bun start
```

### Build

```bash
bun build
```

Outputs optimized assets to the `dist/` directory.

## Project Structure

```
src/
├── App.tsx              # Root component wiring React + Phaser
├── frontend.tsx         # React DOM entry point
├── index.ts             # Bun server entry point
├── index.html           # HTML template
├── index.css            # Global styles
│
├── game/
│   ├── GameRoot.tsx     # React wrapper for Phaser canvas
│   └── phaser/
│       ├── createGame.ts           # Phaser game factory
│       ├── scenes/
│       │   └── BattleScene.ts      # Main battle scene
│       └── core/
│           ├── types.ts            # Shared TypeScript types
│           ├── battleBus.ts        # Event bus for React↔Phaser
│           ├── grid.ts             # Grid coordinate helpers
│           └── chipSystem.ts       # Chip library & drawing logic
│
└── ui/
    └── BattleHUD.tsx    # React overlay (gauge, chip menu, logs)
```

## Architecture

### Event Bus Pattern

The `BattleBus` class provides bidirectional communication between React and Phaser:

```typescript
interface IBattleBus {
  emit(evt: BattleEvent): void;
  subscribe(fn: (evt: BattleEvent) => void): () => void;
}
```

**Event Types:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `GAUGE_CHANGED` | Phaser → React | Custom gauge progress (0-1) |
| `CHIP_MENU_OPENED` | Phaser → React | Opens chip selection with hand |
| `CHIP_SELECTED` | React → Phaser | Player selected a chip |
| `LOG` | Phaser → React | Battle log messages |
| `HP_CHANGED` | Phaser → React | Player and enemy HP data (current/max) |

### Grid System

The battlefield consists of two 3x3 grids separated by a gap:

```
┌───┬───┬───┐     ┌───┬───┬───┐
│0,0│1,0│2,0│     │0,0│1,0│2,0│
├───┼───┼───┤     ├───┼───┼───┤
│0,1│1,1│2,1│     │0,1│1,1│2,1│  ← Enemy side
├───┼───┼───┤     ├───┼───┼───┤
│0,2│1,2│2,2│     │0,2│1,2│2,2│
└───┴───┴───┘     └───┴───┴───┘
  Player side
```

Grid configuration (`GridConfig`):
- `origin`: Top-left pixel coordinate
- `cellSize`: 72px per cell
- `colsPerSide`: 3 columns per side
- `rows`: 3 rows
- `gap`: 110px between sides

### Chip System

Three chips are currently implemented:

| Chip | Power | Description |
|------|-------|-------------|
| **Cannon** | 40 | Straight shot projectile |
| **Sword** | 80 | Melee attack (1 tile) |
| **Guard** | — | Blocks incoming damage |

The `drawRandomChips(count)` function randomly selects chips from the library for the player's hand.

## Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** | Move player on grid |
| **Z** | Open chip menu (when gauge is full) |
| **X** | Fire Cannon (debug action) |

## Gameplay Loop

1. **Gauge Fills**: The Custom Gauge fills automatically over time (~5.5 seconds to full)
2. **Chip Selection**: When full, press **Z** to open the chip menu
3. **Execute Chip**: Select a chip from the React HUD to execute it
4. **Action**: The chip effect plays in Phaser (e.g., Cannon fires a projectile)
5. **Repeat**: Gauge resets and the cycle continues

## React Components

### `<App />`
Root component that creates the shared `BattleBus` and renders:
- `<GameRoot />` - Phaser canvas container
- `<BattleHUD />` - Overlay UI

### `<GameRoot />`
Mounts the Phaser game instance into a div. Handles cleanup on unmount.

### `<BattleHUD />`
Displays:
- **HP Status Bars** (top-left): Player (green) and Enemy (red) health bars with current/max values
- **Custom Gauge** progress bar (right panel)
- **Chip selection menu** (when gauge is full)
- **Dynamic panel height**: Expands from 80px to 480px when gauge reaches 100%
- Battle logs (last 6 messages)

## Phaser Scenes

### `BattleScene`
The main battle scene handles:
- Grid rendering
- Player/enemy spawning and movement
- Input processing (keyboard)
- Chip execution (Cannon projectile)
- Damage dealing and visual feedback
- Gauge management

## API Endpoints

The Bun server includes basic API routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hello` | Returns greeting with method |
| PUT | `/api/hello` | Returns greeting with method |
| GET | `/api/hello/:name` | Returns personalized greeting |

## Development Notes

### Hot Module Reloading
The dev server supports HMR for both React components and server code via `bun --hot`.

### Type Safety
All core types are defined in `src/game/phaser/core/types.ts`:
- `Team`: "PLAYER" | "ENEMY"
- `Cell`: Grid coordinates
- `Vec2`: Pixel coordinates
- `Chip`: Battle chip definition
- `HPData`: Health point data (`{ current: number; max: number }`)
- `BattleEvent`: Union type for all events (GAUGE_CHANGED, CHIP_MENU_OPENED, CHIP_SELECTED, LOG, HP_CHANGED)

## Future Improvements

- [x] HP status bars for player and enemy
- [x] Dynamic panel height based on gauge state
- [ ] Implement Sword melee attack
- [ ] Implement Guard defensive chip
- [ ] Add enemy AI movement and attacks
- [ ] Chip codes and matching system (like original BN)
- [ ] Multiple battle chips per turn (Program Deck)
- [ ] Status effects (stun, paralysis, etc.)
- [ ] Battlefield panel types (cracked, holy, etc.)
- [ ] Sound effects and music
- [ ] Sprite-based graphics
- [ ] Player damage and game over state

## License

Private project - All rights reserved.
