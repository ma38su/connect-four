import { RandomXorshift } from "./RandomXorshift.ts";
import { State, WinningStatus } from "./State.ts";
import { randomAction } from "./random.ts";

function playout(state: State, rgen: RandomXorshift): number {
  switch (state.getWinningStatus()) {
    case WinningStatus.WIN:
      return 1;
    case WinningStatus.LOSE:
      return 0;
    case WinningStatus.DRAW:
      return 0.5;
    default:
      state.advance(randomAction(state, rgen));
      return 1 - playout(state, rgen);
  }
}

function playGame(stateFactory: () => State, strategy: (state: State) => number) {
  const state = stateFactory();
  while (!state.isDone()) {
    state.advance(strategy(state));
    console.log(state.toString());
  }
}

function calculateWinRate(state: State) {
  switch (state.getWinningStatus()) {
    case WinningStatus.WIN:
      return 1;
    case WinningStatus.LOSE:
      return 0;
    default:
      return 0.5;
  }
}
function calculateFirstPlayerScoreForWinRate(state: State) {
  const winRate = calculateWinRate(state);
  return state.isFirstPlayer() ? winRate : 1 - winRate;
}

export {
  playout,
  playGame,
  calculateWinRate,
  calculateFirstPlayerScoreForWinRate,
}