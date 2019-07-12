import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//stateless functional component
function Square(props) {
    const className = "square" + (props.highlight ? ' highlight' : '');

    return (
        <button
            className={className}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        const winnerMoves = this.props.winnerMoves;

        return (
            <Square key={i}
                //value and onClick are both props sent to Square component
                value={this.props.squares[i]}
                //passing the location of each square into the onClick handler
                onClick={() => this.props.onClick(i)}
                highlight={winnerMoves && winnerMoves.includes(i)}
            />
        );
    }

    render() {
        const boardSize = 3;
        let squares = [];

        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) {
                row.push(this.renderSquare(i * boardSize + j));
            }
            squares.push(<div key={i} className="board-row">{row}</div>)
        }

        return (
            <div>{squares}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            stepNumber: 0,
            isOrderAsc: true
        };
    }

    handleClick(i) {
        //if we go to a previous move and them make a new one, we clear the "future" history
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        //create a copy of the array
        const squares = current.squares.slice();
        //if there is already a winner or the square is filled, return early
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        //set current square
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        //update state
        this.setState({
            history: history.concat([{
                squares: squares,
                lastestMove: i //save the index of the most recent move
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        })
    }

    handleToggleOrder() {
        this.setState({
            isOrderAsc: !this.state.isOrderAsc
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares).winner;
        const winnerMoves = calculateWinner(current.squares).line;
        const isDraw = calculateWinner(current.squares).isDraw;

        let moves = history.map((step, move) => {
            const latestMove = step.lastestMove;
            const row = Math.floor(latestMove / 3) + 1;
            const column = (latestMove % 3) + 1;

            const desc = move ? 'Go to move #' + move + ' at row ' + row + ', column ' + column : 'Go to game start';
            return (
                <li key={move}>
                    <button
                        className={this.state.stepNumber === move ? 'move-button-selected' : ''}
                        onClick={() => this.jumpTo(move)}
                    >{desc}</button>
                </li>
            )
        });

        const isOrderAsc = this.state.isOrderAsc;
        if (!isOrderAsc) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if (isDraw) {
                status = 'Draw';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winnerMoves={winnerMoves}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button
                        onClick={() => this.handleToggleOrder()}
                    >{isOrderAsc ? 'Sort Descending' : 'Sort Ascending'}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i],
                isDraw: false
            }
        }
    }

    let isDraw = true;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            isDraw = false;
            break;
        }
    }

    return {
        winner: null,
        line: null,
        isDraw: isDraw
    };
}