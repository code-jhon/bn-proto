import type { Chip } from "./types";

export const CHIP_LIBRARY: Record<string, Chip> = {
  CANNON: { id: "CANNON" as const, name: "Cannon", description: "Straight shot", icon: "fa-solid fa-crosshairs", power: 40 },
  SWORD: { id: "SWORD" as const, name: "Sword", description: "Melee 1 tile", icon: "fa-solid fa-khanda", power: 80 },
  GUARD: { id: "GUARD" as const, name: "Guard", description: "Blocks damage", icon: "fa-solid fa-shield-halved" },
};

export function drawRandomChips(count: number): Chip[] {
  const ids = Object.keys(CHIP_LIBRARY);
  const result: Chip[] = [];
  for (let i = 0; i < count; i++) {
    const pick = ids[Math.floor(Math.random() * ids.length)]!;
    result.push(CHIP_LIBRARY[pick]!);
  }
  return result;
}
