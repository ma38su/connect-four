import React from "react";
import { ActionIcon, Button, Stack } from "@mantine/core";
import { IconArrowBadgeDownFilled, IconCircleFilled } from "@tabler/icons-react";

import { ConnectFourState } from "./ConnectFourState.ts";
import { WinningStatus } from "./State.ts";
import { mctsAction, mctsScores } from "./MCTS.ts";
import { TimeKeeper } from "../utils/TimeKeeper.ts";
import { RandomXorshift } from "../utils/RandomXorshift.ts";

const H = 6;
const W = 7;
const CELL_SIZE = 50;

type GameState = {
  player: number,
  status: WinningStatus,
  table: number[][],
  scores: number[],
}

function build(state: ConnectFourState): GameState {
  const table: number[][] = [];
  for (let y = H - 1; y >= 0; --y) {
    const array: number[] = [];
    for (let x = 0; x < W; ++x) {
      if (state.myBoard[y][x]) {
        array.push(state.isFirstPlayer() ? 1 : -1);
      } else if (state.enermyBoard[y][x]) {
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
  }
}

function toImage(value: number) {
  if (value > 0) {
    return <IconCircleFilled style={{color: 'blue'}} />
  } else if (value < 0) {
    return <IconCircleFilled style={{color: 'red'}} />
  } else {
    return '';
  }
}

function toActionIcon(value: number) {
  if (value > 0) {
    return <IconArrowBadgeDownFilled style={{color: 'blue'}} size={`${30}px`} />
  } else if (value < 0) {
    return <IconArrowBadgeDownFilled style={{color: 'red'}} size={`${30}px`} />
  } else {
    return '';
  }
}
const state = new ConnectFourState();
const rgen = new RandomXorshift();

function ConnectFourBoard() {

  const [player1, setPlayer1] = React.useState(0);
  const [player2, setPlayer2] = React.useState(0);
  const [gameState, setGameState] = React.useState(build(state));
  const [scoreVisible, setScoreVisible] = React.useState(false);

  const handleAction = (action: number) => {
    state.advance(action);
    setGameState(build(state));
  }

  function resetGame() {
    state.reset();
    setGameState(build(state));
  }
  
  const { table, status, player, scores } = gameState;

  React.useEffect(() => {
    if (state.isDone()) {
      return;
    }
    if ((player1 > 0 && player > 0) || (player2 > 0 && player < 0)) {
      setTimeout(() => {
        if (state.isDone()) {
          return;
        }

        const action = mctsAction(state, rgen, new TimeKeeper(player > 0 ? player1 : player2));
        state.advance(action);
        setGameState(build(state));
      }, 500);
    }
  }, [gameState, player, player1, player2]);

  const legalActions = state.legalActions();

  const buttons: (JSX.Element | null)[] = [];
  for (let i = 0; i < W; ++i) {
    const disabled = (status != WinningStatus.NONE) || !legalActions.includes(i) || (player1 > 0 && state.isFirstPlayer()) || (player2 > 0 && !state.isFirstPlayer());
    if (disabled) {
      buttons.push(null);
      continue;
    }
    const button = <ActionIcon key={`button${i}`} color='gray' onClick={e => handleAction(i)} style={{width: CELL_SIZE}}>{toActionIcon(player)}</ActionIcon>;
    buttons.push(button);
  }

  function statusToLabel(status: WinningStatus, player: number) {
    switch (status) {
      case WinningStatus.WIN:
        return <div style={{height: 40}}>WIN {toImage(player)}</div>
      case WinningStatus.LOSE:
        return <div style={{height: 40}}>WIN {toImage(-player)}</div>
      case WinningStatus.DRAW:
        return <div style={{height: 40}}>DRAW</div>
      default:
        return <div style={{height: 40}}></div>
    }
  }

  return (
    <Stack align='center'>
      {statusToLabel(status, player)}
      <table style={{borderCollapse: 'collapse'}}>
        <thead>
          <tr key={`tr${0}`} style={{}}>
          {
            scores.map((score, i) => {
              return <td key={i} style={{width: CELL_SIZE, height: CELL_SIZE, textAlign: 'center', color: player > 0 ? 'blue' : 'red'}}>{(scoreVisible && !Number.isNaN(score)) ? `${(score*100).toFixed(1)}%` : '-'}</td>
            })
          }
          </tr>
          <tr key={`tr${1}`} style={{}}>
          {
            buttons.map((button, i) => {
              if (button == null) {
                return <td key={i} style={{width: CELL_SIZE, height: CELL_SIZE}}></td>
              }
              return (
                <td key={i} style={{width: CELL_SIZE, height: CELL_SIZE, textAlign: 'center', paddingBottom: 10}}>
                  {button}
                </td>
              )
            })
          }
          </tr>
        </thead>
        <tbody>
        { table.map((row, i) => (
          <tr key={`tr${i}`}>
            {
              row.map((value, j) => (
                <td key={j} style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  border: 'solid',
                  fontSize: 50,
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                }}>
                  {toImage(value)}
                </td>
              ))
            }
            </tr>
          ))
        }
        </tbody>
      </table>

      <Button color='gray' onClick={e => resetGame()}>Reset</Button>
      <Button color={scoreVisible ? 'green' : 'gray'} onClick={(_) => setScoreVisible(!scoreVisible)}>Score</Button>
      <Button.Group>
        {
          [0, 5, 10, 100].map((val, i) => <Button key={i} color={player1 === val ? 'blue' : 'gray'} onClick={e => setPlayer1(val)}>{val === 0 ? 'Player' : `Lv.${i}`}</Button>)
        }
      </Button.Group>
      <Button.Group>
        {
          [0, 5, 10, 100].map((val, i) => <Button key={i} color={player2 === val ? 'red' : 'gray'} onClick={e => setPlayer2(val)}>{val === 0 ? 'Player' : `Lv.${i}`}</Button>)
        }
      </Button.Group>
    </Stack>
  );
}
export { ConnectFourBoard }