import { ReactNode, useState } from "react";

type State = {
  board: (0 | 1 | 2)[];
  lastSlotPlayed: number;
  color: 1 | 2;
};

function check(
  board: State["board"],
  index: number,
  inc: number,
  acc: { index: number; color: 1 | 2 }[] = []
): { color: 1 | 2; index: number }[] | false {
  if (index < 0) {
    return false;
  }
  const color = board[index];
  if (!color) {
    return false;
  }
  const nextAcc = [...acc, { index, color }];
  if (nextAcc.some((item) => item.color !== color)) {
    return false;
  }
  if (nextAcc.length >= 4) {
    return nextAcc;
  }
  return index >= inc ? check(board, index - inc, inc, nextAcc) : false;
}

function lastIndexPlayed({
  board,
  lastSlotPlayed,
}: Pick<State, "board" | "lastSlotPlayed">) {
  return board.findLastIndex((color, ix) => color && ix % 7 === lastSlotPlayed);
}

function winner({ board, lastSlotPlayed }: State) {
  const index = lastIndexPlayed({ board, lastSlotPlayed });
  return (
    [1, 6, 7, 8]
      .flatMap((inc) =>
        [1, 2, 3].flatMap((offset) =>
          [-1, 1].map((x) => check(board, index + inc * offset * x, inc * x))
        )
      )
      .find((x) => x) || false
  );
}

function move(slot: number) {
  return function (state: State): State {
    const { board, color } = state;
    const index = board.findIndex(
      (color, index) => !color && index % 7 === slot
    );
    return ~index
      ? {
          board: [...board.slice(0, index), color, ...board.slice(index + 1)],
          color: color === 1 ? 2 : 1,
          lastSlotPlayed: slot,
        }
      : state;
  };
}

function initialState(): State {
  return {
    board: Array(42).fill(0),
    lastSlotPlayed: -1,
    color: 1,
  };
}

function Board({
  active,
  children,
}: {
  active: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap-reverse",
        width: 880,
        gap: 30,
        padding: 30,
        background: active ? "#0075e1" : "#999",
        boxShadow: "inset 0 0 0 4px rgba(0, 0, 0, 0.2)",
      }}
    >
      {children}
    </div>
  );
}

function Slot({
  color,
  disabled,
  onClick,
}: {
  color: 1 | 2;
  disabled: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      style={{
        appearance: "none",
        border: 0,
        margin: 0,
        padding: 15,
        background: "transparent",
        cursor: disabled ? "default" : "grab",
      }}
    >
      <Cell color={hover && !disabled ? color : 0} />
    </button>
  );
}

function Cell({ color, stroke }: { color: 0 | 1 | 2; stroke?: boolean }) {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: 999,
        background: ["#fff", "#f73d1f", "#fbdf23"][color],
        boxShadow: stroke ? "0 0 0 4px rgba(0, 0, 0, 0.2)" : undefined,
        display: "grid",
        placeItems: "center",
      }}
    />
  );
}

export default function App() {
  const [state, setState] = useState(initialState);
  const win = winner(state);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex" }}>
        {Array.from(Array(7), (_, ix) => (
          <Slot
            key={ix}
            color={state.color}
            disabled={!!win}
            onClick={() => {
              setState(move(ix));
            }}
          />
        ))}
      </div>
      <Board active={!win}>
        {state.board.map((color, ix) => (
          <Cell
            key={ix}
            color={!win || win.some((w) => w.index === ix) ? color : 0}
            stroke
          />
        ))}
      </Board>
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => {
            setState(initialState);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
