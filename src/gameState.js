import { modFox, modScene, togglePoopBag, writeModal } from "./ui";
import {
  RAIN_CHANCE,
  SCENES,
  DAY_LENGTH,
  NIGHT_LENGTH,
  getNextDieTime,
  getNextHungerTime,
  getNextPoopTime,
} from "./constants";

const gameState = {
  state: "INIT",
  clock: 1,
  wakeTime: -1,
  sleepTime: -1,
  hungryTime: -1,
  dieTime: -1,
  poopTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  tick() {
    this.clock++;

    if (this.clock === this.wakeTime) {
      this.wake();
    } else if (this.clock === this.sleepTime) {
      this.sleep();
    } else if (this.clock === this.hungryTime) {
      this.getHungry();
    } else if (this.clock === this.dieTime) {
      this.die();
    } else if (this.clock === this.timeToStartCelebrating) {
      this.startCelebrating();
    } else if (this.clock === this.timeToEndCelebrating) {
      this.endCelebrating();
    } else if (this.clock === this.poopTime) {
      this.poop();
    }

    return this.clock;
  },
  handleUserAction(icon) {
    if (["SLEEP", "FEEDING", "HATCHING", "CELEBRATING"].includes(this.state)) {
      //do nothing
      return;
    }

    if (this.state === "INIT" || this.state === "DEAD") {
      this.startGame();
      return;
    }

    switch (icon) {
      case "weather":
        this.changeWeather();
        break;
      case "poop":
        this.cleanUpPoop();
        break;
      case "fish":
        this.feed();
        break;
    }
  },
  startGame() {
    this.state = "HATCHING";
    this.wakeTime = this.clock + 3;
    modFox("egg");
    modScene("day");
    writeModal("");
  },
  wake() {
    this.state = "IDLING";
    this.wakeTime = -1;
    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
    modScene(SCENES[this.scene]);
    this.sleepTime = this.clock + DAY_LENGTH;
    this.hungryTime = getNextHungerTime(this.clock);
    this.determineFoxState();
  },
  sleep() {
    this.state = "SLEEP";
    modFox("sleep");
    modScene("night");
    this.clearTimes();
    this.wakeTime = this.clock + NIGHT_LENGTH;
  },
  getHungry() {
    this.state = "HUNGRY";
    modFox("hungry");
    this.dieTime = getNextDieTime(this.clock);
    this.hungryTime = -1;
  },
  die() {
    this.state = "DEAD";
    modScene("dead");
    modFox("dead");
    this.clearTimes();
    writeModal("The fox died :( <br /> Press the middle button to start.");
  },
  startCelebrating() {
    this.state = "CELEBRATING";
    modFox("celebrate");
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
  },
  endCelebrating() {
    this.timeToEndCelebrating = -1;
    this.state = "IDLING";
    this.determineFoxState();
    togglePoopBag(false);
  },
  determineFoxState() {
    if (this.state === "IDLING") {
      if (SCENES[this.scene] === "rain") {
        modFox("rain");
      } else {
        modFox("idling");
      }
    }
  },
  changeWeather() {
    this.scene = (this.scene + 1) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
  },
  feed() {
    if (this.state !== "HUNGRY") {
      return;
    }

    this.state = "FEEDING";
    this.dieTime = -1;
    this.poopTime = getNextPoopTime(this.clock);
    modFox("eating");
    this.timeToStartCelebrating = this.clock + 2;
  },
  poop() {
    this.state = "POOPING";
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox("pooping");
  },
  cleanUpPoop() {
    if (this.state !== "POOPING") {
      return;
    }

    this.dieTime = -1;
    togglePoopBag(true);
    this.startCelebrating();
    this.hungryTime = getNextHungerTime(this.clock);
  },
  clearTimes() {
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungryTime = -1;
    this.dieTime = -1;
    this.poopTime = -1;
    this.timeToEndCelebrating = -1;
    this.timeToStartCelebrating = -1;
  },
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);
export default gameState;
