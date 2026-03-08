import { RandomXorshift } from "../utils/RandomXorshift";
import { Action, State } from "./State";

function randomAction(state: State, rgen: RandomXorshift): Action {
  const legalActions = state.legalActions();
  return legalActions[rgen.nextInt(legalActions.length)]!;
}

export { randomAction }
