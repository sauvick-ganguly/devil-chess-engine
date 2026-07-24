import { useState } from "react";
import Square from "./Square";
import Piece from "./Piece";
import GameOverModal from "./GameOverModal";
import PromotionModal from "./PromotionModal";
import { playSound } from "../utils/soundManager";
import AnimatedPiece from "./AnimatedPiece";

import {
    toChessSquare,
    moveToNotation
} from "../utils/chessNotation";

import {
    pieceMoves,
    applyMove,
    isKingInCheck,
    countKingsInCheck,
    getGameStatus,
    getCheckNotation,
    isSpecificKingInCheck
} from "../utils/gameLogic";

import { createInitialBoard } from "../utils/constants";

function ChessBoard({ game }) {

    const {

        board,
        setBoard,

        turn,
        setTurn,

        selectedSquare,
        setSelectedSquare,

        legalMoves,
        setLegalMoves,

        gameOver,
        setGameOver,

        winner,
        setWinner,

        capturedByWhite,
        setCapturedByWhite,

        capturedByBlack,
        setCapturedByBlack,

        moveHistory,
        setMoveHistory,

        promotion,
        setPromotion,

        promotionSquare,
        setPromotionSquare,

        pendingPromotionMove,
        setPendingPromotionMove,

        undoStack,
        setUndoStack,

        lastMove,
        setLastMove,

        flipped,
        setFlipped,

    } = game;

    const [gameStatus, setGameStatus] = useState({
        draw: false,
        reason: null
    });
    const [animatingMove, setAnimatingMove] = useState(null);

    function handleNewGame() {

        setBoard(createInitialBoard());

        setTurn("w");

        setSelectedSquare(null);
        setLegalMoves([]);

        setCapturedByWhite([]);
        setCapturedByBlack([]);

        setMoveHistory([]);

        setPromotion(null);
        setPromotionSquare(null);

        setWinner(null);
        setGameOver(false);

        setGameStatus({
            draw: false,
            reason: null
        });
    }

    function handlePromotion(pieceType) {

        const newBoard = pendingPromotionMove.board.map(row => [...row]);

        newBoard[promotionSquare.row][promotionSquare.col] = {
            type: pieceType,
            color: promotion.color
        };

        setBoard(newBoard);

        setLastMove({
            piece: pieceType,
            color: promotion.color,

            from: pendingPromotionMove.from,
            to: pendingPromotionMove.to
        });

        const nextTurn = turn === "w" ? "b" : "w";

        const status = getGameStatus(
            newBoard,
            nextTurn
        );

        setGameStatus(status);
        const enemyColor = turn === "w" ? "b" : "w";

        const { check, checkmate } = getCheckNotation(
            newBoard,
            enemyColor,
            nextTurn
        );
        let sound = "move";

        if (checkmate) {
            sound = "checkmate";
        }
        else if (check) {
            sound = "check";
        }
        else if (pendingPromotionMove.capturedPiece) {
            sound = "capture";
        }

        // Capture History
        if (pendingPromotionMove.capturedPiece) {

            if (turn === "w") {

                setCapturedByWhite(prev => [
                    ...prev,
                    pendingPromotionMove.capturedPiece
                ]);

            } else {

                setCapturedByBlack(prev => [
                    ...prev,
                    pendingPromotionMove.capturedPiece
                ]);

            }
        }

        // Move History
        setMoveHistory(prev => [
            ...prev,
            {
                piece: "P",
                color: turn,

                from: toChessSquare(
                    pendingPromotionMove.from.row,
                    pendingPromotionMove.from.col
                ),

                to: toChessSquare(
                    pendingPromotionMove.to.row,
                    pendingPromotionMove.to.col
                ),

                captured: pendingPromotionMove.capturedPiece
                    ? pendingPromotionMove.capturedPiece.type
                    : null,

                capturedColor: pendingPromotionMove.capturedPiece
                    ? pendingPromotionMove.capturedPiece.color
                    : null,

                notation: moveToNotation({
                    piece: "P",
                    from: toChessSquare(
                        pendingPromotionMove.from.row,
                        pendingPromotionMove.from.col
                    ),
                    to: toChessSquare(
                        pendingPromotionMove.to.row,
                        pendingPromotionMove.to.col
                    ),
                    captured: pendingPromotionMove.capturedPiece
                        ? pendingPromotionMove.capturedPiece.type
                        : null,
                    promotion: pieceType,
                    check,
                    checkmate
                })
            }
        ]);

        setPendingPromotionMove(null);

        setPromotion(null);
        setPromotionSquare(null);

        if (status.gameOver) {
            setGameOver(true);
            setWinner(status.winner);
            return;
        }

        setTurn(turn === "w" ? "b" : "w");
        if (status.gameOver) {
            playSound("checkmate");
        }
        else if (check) {
            playSound("check");
        }
        else if (pendingPromotionMove.capturedPiece) {
            playSound("capture");
        }
        else {
            playSound("promote");
        }
        playSound(sound);
    }
    function handleUndo() {

        if (undoStack.length === 0) return;

        const previous = undoStack[undoStack.length - 1];

        setBoard(previous.board);
        setTurn(previous.turn);

        setCapturedByWhite(previous.capturedByWhite);
        setCapturedByBlack(previous.capturedByBlack);

        setMoveHistory(previous.moveHistory);

        setGameOver(previous.gameOver);
        setWinner(previous.winner);

        // Clear temporary UI state
        setSelectedSquare(null);
        setLegalMoves([]);

        setPromotion(null);
        setPromotionSquare(null);
        setPendingPromotionMove(null);

        // Remove the restored snapshot
        setUndoStack(prev => prev.slice(0, -1));
    }

    const handleSquareClick = (row, col) => {

        // Stop if game is over
        if (gameOver) return;

        // ==========================
        // Move a selected piece
        // ==========================
        if (selectedSquare) {

            const move = legalMoves.find(
                m => m.row === row && m.col === col
            );

            if (move) {

                const movedPiece =
                    board[selectedSquare.row][selectedSquare.col];

                let capturedPiece = board[row][col];

                if (move?.enPassant) {

                    capturedPiece =
                        movedPiece.color === "w"
                            ? board[row + 1][col]
                            : board[row - 1][col];

                }

                setUndoStack(prev => [
                    ...prev,
                    {
                        board: board.map(row =>
                            row.map(piece =>
                                piece ? { ...piece } : null
                            )
                        ),

                        turn,

                        capturedByWhite: [...capturedByWhite],
                        capturedByBlack: [...capturedByBlack],

                        moveHistory: [...moveHistory],

                        gameOver,
                        winner
                    }
                ]);
                const newBoard = applyMove(
                    board,
                    selectedSquare.row,
                    selectedSquare.col,
                    move.row,
                    move.col,
                    move
                );
                // Pawn Promotion
                const isPromotion =
                    movedPiece.type === "P" &&
                    (
                        (movedPiece.color === "w" && row === 0) ||
                        (movedPiece.color === "b" && row === 7)
                    );

                if (isPromotion) {

                    setBoard(newBoard);

                    setPendingPromotionMove({
                        board: newBoard,
                        movedPiece,
                        capturedPiece,
                        from: {
                            row: selectedSquare.row,
                            col: selectedSquare.col
                        },
                        to: {
                            row,
                            col
                        }
                    });

                    setPromotion({
                        color: movedPiece.color,
                        from: {
                            row: selectedSquare.row,
                            col: selectedSquare.col
                        },
                        to: {
                            row,
                            col
                        },
                        captured: capturedPiece
                    });

                    setPromotionSquare({
                        row,
                        col
                    });

                    setSelectedSquare(null);
                    setLegalMoves([]);

                    return;
                }

                // Captured Pieces
                if (capturedPiece) {

                    if (turn === "w") {

                        setCapturedByWhite(prev => [
                            ...prev,
                            capturedPiece
                        ]);

                    } else {

                        setCapturedByBlack(prev => [
                            ...prev,
                            capturedPiece
                        ]);

                    }
                }



                setAnimatingMove({
                    piece: movedPiece,
                    from: {
                        row: selectedSquare.row,
                        col: selectedSquare.col
                    },
                    to: {
                        row,
                        col
                    }
                });

                setTimeout(() => {

                    setBoard(newBoard);

                    setAnimatingMove(null);

                    setLastMove({
                        piece: movedPiece.type,
                        color: movedPiece.color,

                        from: {
                            row: selectedSquare.row,
                            col: selectedSquare.col
                        },

                        to: {
                            row,
                            col
                        }
                    });

                    setSelectedSquare(null);
                    setLegalMoves([]);

                    // keep ALL the remaining code here:
                    // getGameStatus()
                    // setGameStatus()
                    // getCheckNotation()
                    // setMoveHistory()
                    // setTurn()
                    // playSound()
                    // gameOver handling

                }, 200);
                const nextTurn = turn === "w" ? "b" : "w";

                const status = getGameStatus(
                    newBoard,
                    nextTurn
                );

                setGameStatus(status);
                const enemyColor = turn === "w" ? "b" : "w";

                const { check, checkmate } = getCheckNotation(
                    newBoard,
                    enemyColor,
                    nextTurn
                );

                let sound = "move";

                if (status.gameOver) {
                    sound = "checkmate";
                }
                else if (check) {
                    sound = "check";
                }
                else if (capturedPiece) {
                    sound = "capture";
                }

                setMoveHistory(prev => [
                    ...prev,
                    {
                        piece: movedPiece.type,
                        color: movedPiece.color,

                        from: toChessSquare(
                            selectedSquare.row,
                            selectedSquare.col
                        ),

                        to: toChessSquare(
                            row,
                            col
                        ),

                        captured: capturedPiece
                            ? capturedPiece.type
                            : null,

                        capturedColor: capturedPiece
                            ? capturedPiece.color
                            : null,

                        notation: moveToNotation({
                            piece: movedPiece.type,
                            from: toChessSquare(
                                selectedSquare.row,
                                selectedSquare.col
                            ),
                            to: toChessSquare(
                                row,
                                col
                            ),
                            captured: capturedPiece
                                ? capturedPiece.type
                                : null,
                            check,
                            checkmate
                        })
                    }
                ]);

                if (status.gameOver) {

                    setGameOver(true);
                    setWinner(status.winner);

                    playSound(sound);

                    return;
                }

                setTurn(
                    turn === "w"
                        ? "b"
                        : "w"
                );

                playSound(sound);

                return;
            }

            // Clicked elsewhere
            setSelectedSquare(null);
            setLegalMoves([]);
        }

        // ==========================
        // Select Piece
        // ==========================

        const piece = board[row][col];

        if (!piece) return;

        if (piece.color !== turn) return;

        setSelectedSquare({
            row,
            col
        });

        const generatedMoves =
            pieceMoves(board, row, col, lastMove).filter(move => {
                console.log(move);

                const newBoard = applyMove(
                    board,
                    row,
                    col,
                    move.row,
                    move.col
                );

                return !isKingInCheck(
                    newBoard,
                    piece.color
                );

            });

        setLegalMoves(generatedMoves);

    };

    console.log(lastMove);
    const rowIndices = [...Array(8).keys()];
    const colIndices = [...Array(8).keys()];

    if (flipped) {
        rowIndices.reverse();
        colIndices.reverse();
    }

    return (
        <div className="board-wrap">

            <div className="board-frame">

                <div className="seam"></div>

                <div className="board">

                    {rowIndices.map((rowIndex) =>
                        colIndices.map((colIndex) => {

                            const piece = board[rowIndex][colIndex];

                            const kingInCheck =
                                piece &&
                                piece.type === "K" &&
                                isSpecificKingInCheck(
                                    board,
                                    piece.color,
                                    rowIndex,
                                    colIndex
                                );
                            const move = legalMoves.find(
                                m =>
                                    m.row === rowIndex &&
                                    m.col === colIndex
                            );

                            const isLegalMove = !!move;
                            const isCapture = move?.capture || false;


                            return (
                                <Square
                                    key={`${rowIndex}-${colIndex}`}
                                    row={rowIndex}
                                    col={colIndex}
                                    isLight={(rowIndex + colIndex) % 2 === 0}
                                    onClick={handleSquareClick}
                                    selected={
                                        selectedSquare?.row === rowIndex &&
                                        selectedSquare?.col === colIndex
                                    }
                                    legalMove={isLegalMove}
                                    captureMove={isCapture}
                                    lastMove={lastMove}
                                    check={kingInCheck}
                                >
                                    <Piece
                                        piece={
                                            animatingMove &&
                                                animatingMove.from.row === rowIndex &&
                                                animatingMove.from.col === colIndex
                                                ? null
                                                : piece
                                        }
                                    />
                                </Square>
                            );

                        })
                    )}

                </div>
                {animatingMove && (
                    <AnimatedPiece
                        piece={animatingMove.piece}
                        from={animatingMove.from}
                        to={animatingMove.to}
                        squareSize={100 / 8}
                    />
                )}

            </div>

            <GameOverModal
                isOpen={gameOver}
                winner={winner}
                draw={gameStatus.draw}
                reason={gameStatus.reason}
                onNewGame={handleNewGame}
                onClose={handleNewGame}
            />

            <PromotionModal
                isOpen={promotion !== null}
                color={promotion?.color}
                onSelect={handlePromotion}
            />

        </div>
    );

}

export default ChessBoard;