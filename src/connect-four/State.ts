type Action = number;

const WinningStatus = {
  NONE: 0,
  WIN: 1,
  LOSE: 2,
  DRAW: 3,
} as const;

type WinningStatus = typeof WinningStatus[keyof typeof WinningStatus];

const stateComparator: (a: ScoredState, b: ScoredState) => number = (a: ScoredState, b: ScoredState) => b.score - a.score;

type Strategy = {
  name: string,
  method: (state: State) => number,
};

interface State {
  firstAction?: number;
  hash?: number;

  legalActions(): Action[];
  isDone(): boolean;
  advance(action: Action): void;

  getWinningStatus(): WinningStatus;
  isFirstPlayer(): boolean;

  clone(): State;
  toString(): string;
}

interface ScoredState extends State {
  clone(): ScoredState;
  score: number;
}

export { WinningStatus, stateComparator }
export type { State, ScoredState, Action, Strategy }