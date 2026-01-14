import { useMemo } from "react";
import { GameRoot } from "./game/GameRoot";
import { BattleHUD } from "./ui/BattleHUD";
import { BattleBus } from "./game/phaser/core/battleBus";

export default function App() {
  const bus = useMemo(() => new BattleBus(), []);

  return (
    <div style={{ position: "relative", width: 900, height: 520, margin: "24px auto" }}>
      <GameRoot bus={bus} />
      <BattleHUD bus={bus} />
    </div>
  );
}
