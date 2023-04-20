import { RandomXorshift } from "./RandomXorshift.ts";
import { State } from "./State.ts";
import { TimeKeeper } from "./TimeKeeper.ts";
import { calculateWinRate, playout } from "./gameHelper.ts";

/** for UCB */
const C = 1;
const EXPAND_THRESHOLD = 10;

class Node {
  private state: State;
  w = 0;
  
  /** 試行回数 */
  childNodes: Node[] = [];
  n = 0;

  constructor(state: State) {
    this.state = state;
  }

  evaluate(rgen: RandomXorshift): number {
    if (this.state.isDone()) {
      const value = calculateWinRate(this.state);
      this.w += value;
      this.n += 1;
      return value;
    }
    if (this.childNodes.length === 0) {
      const clonedState = this.state.clone();
      const value = playout(clonedState, rgen);
      this.w += value;
      this.n += 1;

      if (this.n >= EXPAND_THRESHOLD) {
        this.expand();
      }
      return value;
    }

    const value = 1 - this.nextChildNode().evaluate(rgen);
    this.w += value;
    this.n += 1;
    return value;
  }

  expand() {
    const legalActions = this.state.legalActions();
    this.childNodes = [];
    for (const action of legalActions) {
      const cloned = this.state.clone();
      cloned.advance(action);
      this.childNodes.push(new Node(cloned));
    }
  }

  nextChildNode(): Node {
    for (const childNode of this.childNodes) {
      if (childNode.n === 0) {
        return childNode;
      }
    }
    let t = 0;
    for (const childNode of this.childNodes) {
      t += childNode.n;
    }
    let bestValue = Number.NEGATIVE_INFINITY;
    let bestActionIndex = -1;
    for (let i = 0; i < this.childNodes.length; ++i) {
      const childNode = this.childNodes[i];
      const ucb1Value = 1 - childNode.w / childNode.n + C * Math.sqrt(2 * Math.log(t) / childNode.n);
      if (ucb1Value > bestValue) {
        bestActionIndex = i;
        bestValue = ucb1Value;
      }
    }
    return this.childNodes[bestActionIndex];
  }
}

function mctsAction(state: State, rgen: RandomXorshift, timeKeeper?: TimeKeeper) {
  const rootNode = new Node(state);
  rootNode.expand();
  while (true) {
    if (timeKeeper?.isTimeOver()) {
      break;
    }
    rootNode.evaluate(rgen);
  }

  const legalActions = state.legalActions();
  let bestActionSearchedNumber = -1;
  let bestActionIndex = -1;
  if (legalActions.length !== rootNode.childNodes.length) {
    throw new Error();
  }
  for (let i = 0; i < legalActions.length; ++i) {
    const { n } = rootNode.childNodes[i];
    if (n > bestActionSearchedNumber) {
      bestActionIndex = i;
      bestActionSearchedNumber = n;
    }
  }
  return legalActions[bestActionIndex];
}

function mctsScores(state: State, rgen: RandomXorshift, timeKeeper?: TimeKeeper): number[] {
  const rootNode = new Node(state);
  rootNode.expand();
  while (true) {
    if (timeKeeper?.isTimeOver()) {
      break;
    }
    rootNode.evaluate(rgen);
  }

  const legalActions = state.legalActions();
  if (legalActions.length !== rootNode.childNodes.length) {
    throw new Error();
  }

  const scores: number[] = [];
  for (let x = 0; x < 7; ++x) {
    const i = legalActions.indexOf(x);
    if (i < 0) {
      scores.push(Number.NaN);
      continue;
    }
    const { n, w } = rootNode.childNodes[i];
    const rate = (1 - w / n);
    scores.push(rate);
  }
  return scores;
}

export { mctsAction, mctsScores };