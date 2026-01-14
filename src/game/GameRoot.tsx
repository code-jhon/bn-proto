import { useEffect, useRef } from "react";
import type { IBattleBus } from "./phaser/core/types";
import { createGame } from "./phaser/createGame";

type Props = { bus: IBattleBus };

export function GameRoot({ bus }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const game = createGame(ref.current, bus);
    return () => game.destroy(true);
  }, [bus]);

  return <div ref={ref} style={{ width: 900, height: 520 }} />;
}
