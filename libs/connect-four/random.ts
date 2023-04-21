import { RandomXorshift } from "../utils/RandomXorshift.ts";
import { Action, State } from "./State.ts";

function randomAction(state: State, rgen: RandomXorshift): Action {
  const legalActions = state.legalActions();
  return legalActions[rgen.nextInt(legalActions.length)]
}

export { randomAction }
