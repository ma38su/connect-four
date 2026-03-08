import React from "react";

import { ConnectFourState } from "./ConnectFourState";
import { WinningStatus } from "./State";
import { mctsAction, mctsScores } from "./MCTS";
import { TimeKeeper } from "../utils/TimeKeeper";
import { RandomXorshift } from "../utils/RandomXorshift";

const H = 6;
const W = 7;

type GameState = {
  player: number;
  status: WinningStatus;
  table: number[][];
  scores: number[];
};

function toGameState(state: ConnectFourState): GameState {
  const table: number[][] = [];
  for (let y = H - 1; y >= 0; --y) {
    const array: number[] = [];
    for (let x = 0; x < W; ++x) {
      if (state.myBoard[y]![x]) {
        array.push(state.isFirstPlayer() ? 1 : -1);
      } else if (state.enermyBoard[y]![x]) {
        array.push(state.isFirstPlayer() ? -1 : 1);
      } else {
        array.push(0);
      }
    }
    table.push(array);
  }

  const scores = mctsScores(state, rgen, new TimeKeeper(100));
  return {
    player: state.isFirstPlayer() ? 1 : -1,
    status: state.getWinningStatus(),
    table,
    scores,
  };
}

function CellCircle({ value }: { value: number }) {
  if (value > 0) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="9" fill="#3b82f6" />
      </svg>
    );
  } else if (value < 0) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="9" fill="#ef4444" />
      </svg>
    );
  }
  return null;
}

function ArrowDown({ value }: { value: number }) {
  const color = value > 0 ? "#3b82f6" : value < 0 ? "#ef4444" : "transparent";
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l-8 14h5v6h6v-6h5z" transform="rotate(180 12 12)" />
    </svg>
  );
}

const state = new ConnectFourState();
const rgen = new RandomXorshift();

function ConnectFourBoard() {
  const [player1, setPlayer1] = React.useState(0);
  const [player2, setPlayer2] = React.useState(10);
  const [gameState, setGameState] = React.useState(toGameState(state));
  const [scoreVisible, setScoreVisible] = React.useState(true);

  const handleAction = (action: number) => {
    state.advance(action);
    setGameState(toGameState(state));
  };

  function restartGame() {
    state.reset();
    setGameState(toGameState(state));
  }

  const { table, status, player, scores } = gameState;

  React.useEffect(() => {
    if (state.isDone()) return;
    if ((player1 > 0 && player > 0) || (player2 > 0 && player < 0)) {
      if (state.isDone()) return;
      const action = mctsAction(
        state,
        rgen,
        new TimeKeeper(player > 0 ? player1 : player2),
      );
      state.advance(action!);
      setTimeout(() => {
        setGameState(toGameState(state));
      }, 100);
    }
  }, [gameState, player, player1, player2]);

  const legalActions = state.legalActions();

  function statusToLabel(status: WinningStatus, player: number) {
    switch (status) {
      case WinningStatus.WIN:
        return (
          <span className="flex items-center gap-1">
            <CellCircle value={player} /> wins!
          </span>
        );
      case WinningStatus.LOSE:
        return (
          <span className="flex items-center gap-1">
            <CellCircle value={-player} /> wins!
          </span>
        );
      case WinningStatus.DRAW:
        return <>Draw</>;
      default:
        return <>In progress</>;
    }
  }

  const aiLevels = [0, 5, 10, 100] as const;

  return (
    <div className="flex flex-col items-center gap-4 pb-8">
      <div className="flex h-8 items-center text-lg font-semibold">
        {statusToLabel(status, player)}
      </div>

      <table className="border-collapse">
        <thead>
          <tr>
            {scores.map((score, i) => (
              <td
                key={i}
                className="h-[50px] w-[50px] text-center text-sm"
                style={{ color: player > 0 ? "#3b82f6" : "#ef4444" }}
              >
                {scoreVisible && !Number.isNaN(score)
                  ? `${(score * 100).toFixed(0)}%`
                  : "-"}
              </td>
            ))}
          </tr>
          <tr>
            {Array.from({ length: W }, (_, i) => {
              const disabled =
                status !== WinningStatus.NONE ||
                !legalActions.includes(i) ||
                (player1 > 0 && state.isFirstPlayer()) ||
                (player2 > 0 && !state.isFirstPlayer());
              return (
                <td key={i} className="h-[50px] w-[50px] text-center">
                  {!disabled && (
                    <button
                      className="cursor-pointer rounded p-1 hover:bg-gray-200"
                      onClick={() => handleAction(i)}
                    >
                      <ArrowDown value={player} />
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td
                  key={j}
                  className="h-[50px] w-[50px] border border-gray-700 p-0 text-center align-middle leading-[0]"
                >
                  <CellCircle value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2">
        <button
          className={`cursor-pointer rounded px-4 py-2 text-sm font-medium text-white ${
            scoreVisible
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-500 hover:bg-gray-600"
          }`}
          onClick={() => setScoreVisible(!scoreVisible)}
        >
          Score
        </button>
        <button
          className="cursor-pointer rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          onClick={() => restartGame()}
        >
          Restart
        </button>
      </div>

      <div className="flex">
        {aiLevels.map((val, i) => (
          <button
            key={i}
            className={`cursor-pointer border border-gray-300 px-3 py-2 text-sm font-medium first:rounded-l last:rounded-r ${
              player1 === val
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPlayer1(val)}
          >
            {val === 0 ? "Player 1" : `AI Lv.${i}`}
          </button>
        ))}
      </div>

      <div className="flex">
        {aiLevels.map((val, i) => (
          <button
            key={i}
            className={`cursor-pointer border border-gray-300 px-3 py-2 text-sm font-medium first:rounded-l last:rounded-r ${
              player2 === val
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPlayer2(val)}
          >
            {val === 0 ? "Player 2" : `AI Lv.${i}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export { ConnectFourBoard };
