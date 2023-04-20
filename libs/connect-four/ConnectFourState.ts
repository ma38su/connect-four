import { State, WinningStatus } from "./State.ts";

const H = 6;
const W = 7;

const dx = [1, -1];
const dyRightUp = [1, -1];
const dyLeftUp = [-1, 1];

function evaluateGame(state: ConnectFourState, coordinate: [number, number]): boolean {
  const changeList: ((y: number, action: number) => number)[] = [
    (y, _action) => y,
    (y, action) => y + dyRightUp[action],
    (y, action) => y + dyLeftUp[action],
  ]

  for (const func of changeList) {
    const que: [number, number][] = [coordinate];
    const check: boolean[][] = [];
    for (let i = 0; i < H; ++i) {
      const array: boolean[] = [];
      for (let j = 0; j < W; ++j) {
        array.push(false);
      }
      check.push(array);
    }

    let count = 0;
    while (que.length > 0) {
      const tmpCod = que.pop();
      if (tmpCod == null) throw new Error();

      count += 1;
      if (count >= 4) {
        return true;
      }
      const [tmpCodY, tmpCodX] = tmpCod;
      check[tmpCodY][tmpCodX] = true;

      for (let action = 0; action < 2; ++action) {
        const ty = func(tmpCodY, action);
        const tx = tmpCodX + dx[action];
        if (ty < 0 || ty >= H || tx < 0 || tx >= W) {
          continue;
        }
        if (!state.myBoard[ty][tx]) {
          continue;
        }
        if (check[ty][tx]) {
          continue;
        }
        que.push([ty, tx]);
      }
    }
  }

  let [ty, tx] = coordinate;
  let isWin = true;
  for (let i = 0; i < 4; ++i) {
    const isMine = (ty >= 0 && ty < H && tx >= 0 && tx < W && state.myBoard[ty][tx]);
    if (!isMine) {
      isWin = false;
      break;
    }
    ty -= 1;
  }
  return isWin;
}

function newBoard(H: number, W: number) {
  const board: boolean[][] = [];
  for (let y = 0; y < H; ++y) {
    const array = [];
    for (let x = 0; x < W; ++x) {
      array.push(false);
    }
    board.push(array);
  }
  return board;
}

class ConnectFourState implements State {

  score = 0;
  isFirst = true;
  winingStatus: WinningStatus = WinningStatus.NONE;

  myBoard: boolean[][];
  enermyBoard: boolean[][];

  constructor() {
    this.myBoard = newBoard(H, W);
    this.enermyBoard = newBoard(H, W);
  }

  reset() {
    this.score = 0;
    this.isFirst = true;
    this.winingStatus = WinningStatus.NONE;

    for (let y = 0; y < H; ++y) {
      for (let x = 0; x < W; ++x) {
        this.myBoard[y][x] = false;
        this.enermyBoard[y][x] = false;
      }
    }
  }

  isDone(): boolean {
    return this.winingStatus !== WinningStatus.NONE;
  }

  getWinningStatus(): WinningStatus {
    return this.winingStatus;
  }

  legalActions(): number[] {
    const actions: number[] = [];
    for (let x = 0; x < W; ++x) {
      for (let y = H - 1; y >= 0; --y) {
        if (!this.myBoard[y][x] && !this.enermyBoard[y][x]) {
          actions.push(x);
          break;
        }
      }
    }
    return actions;
  }

  advance(action: number): void {
    let coordinate: [number, number] | null = null;
    for (let y = 0; y < H; ++y) {
      if (!this.myBoard[y][action] && !this.enermyBoard[y][action]) {
        this.myBoard[y][action] = true;
        coordinate = [y, action];
        break;
      }
    }

    if (coordinate == null) {
      this.winingStatus = WinningStatus.DRAW;
      return;
    }

    if (evaluateGame(this, coordinate)) {
      this.winingStatus = WinningStatus.LOSE;
    }

    { // swap boards
      const tmpBoard = this.myBoard;
      this.myBoard = this.enermyBoard;
      this.enermyBoard = tmpBoard;
    }
    this.isFirst = !this.isFirst;
    if (this.winingStatus === WinningStatus.NONE && this.legalActions().length === 0) {
      this.winingStatus = WinningStatus.DRAW;
    }
  }

  isFirstPlayer() {
    return this.isFirst;
  }

  clone(): State {
    const cloned = new ConnectFourState();
    cloned.score = this.score;
    cloned.isFirst = this.isFirst;
 
    cloned.myBoard = this.myBoard.map(ary => [...ary]);
    cloned.enermyBoard = this.enermyBoard.map(ary => [...ary]);
    cloned.winingStatus = this.winingStatus;

    return cloned;
  }

  toString(): string {
    let ss = '';
    switch (this.winingStatus) {
      case WinningStatus.WIN:
        ss += `WIN: ${this.isFirst ? 'x' : 'o'}\n`;
        break;
      case WinningStatus.LOSE:
        ss += `WIN: ${this.isFirst ? 'o' : 'x'}\n`;
        break;
      case WinningStatus.DRAW:
        ss += 'DRAW\n';
        break;
      default:
        ss += `trun: ${this.isFirst ? 'x' : 'o'}\n`;
        break;
    }
    for (let y = H - 1; y >= 0; --y) {
      for (let x = 0; x < W; ++x) {
        if (this.myBoard[y][x]) {
          ss += this.isFirst ? 'x' : 'o';
        } else if (this.enermyBoard[y][x]) {
          ss += this.isFirst ? 'o' : 'x';
        } else {
          ss += '.';
        }
      }
      ss += '\n';
    }
    return ss;
  }
}

export { ConnectFourState };
