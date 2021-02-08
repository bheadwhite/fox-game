import { TICK_RATE } from "./constants";
import game, { handleUserAction } from "./gameState";
import initButtons from "./buttons";

async function init() {
  initButtons(handleUserAction);
  let nextTimeToTick = Date.now();
  const nextAnimationFrame = () => {
    const now = Date.now();

    if (nextTimeToTick <= now) {
      game.tick();
      nextTimeToTick = now + TICK_RATE;
    }
    requestAnimationFrame(nextAnimationFrame);
  };
  nextAnimationFrame();
}

init();
