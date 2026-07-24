import { useState } from "react";
import { createInitialBoard } from "../utils/constants";
import { countKingsInCheck } from "../utils/gameLogic";

function useGame() {

    const [board, setBoard] = useState(createInitialBoard());

    const [turn, setTurn] = useState("w");

    const [selectedSquare, setSelectedSquare] = useState(null);

    const [legalMoves, setLegalMoves] = useState([]);

    const [capturedByWhite, setCapturedByWhite] = useState([]);

    const [capturedByBlack, setCapturedByBlack] = useState([]);

    const [moveHistory, setMoveHistory] = useState([]);

    const [gameOver, setGameOver] = useState(false);

    const [winner, setWinner] = useState(null);

    const [promotion, setPromotion] = useState(null);

    const [promotionSquare, setPromotionSquare] = useState(null);

    const [pendingPromotionMove, setPendingPromotionMove] = useState(null);

    const [undoStack, setUndoStack] = useState([]);

    const [lastMove, setLastMove] = useState(null);

    const [flipped, setFlipped] = useState(false);

    const [animatingMove, setAnimatingMove] = useState(null);

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

        setSelectedSquare(null);
        setLegalMoves([]);

        setPromotion(null);
        setPromotionSquare(null);
        setPendingPromotionMove(null);

        setUndoStack(prev => prev.slice(0, -1));
    }

    return {
        board,
        setBoard,
        turn,
        setTurn,
        selectedSquare,
        setSelectedSquare,
        legalMoves,
        setLegalMoves,
        capturedByWhite,
        setCapturedByWhite,
        capturedByBlack,
        setCapturedByBlack,
        moveHistory,
        setMoveHistory,
        gameOver,
        setGameOver,
        winner,
        setWinner,
        promotion,
        setPromotion,
        promotionSquare,
        setPromotionSquare,
        pendingPromotionMove,
        setPendingPromotionMove,
        undoStack,
        setUndoStack,
        handleUndo,
        lastMove,
        setLastMove,
        flipped,
        setFlipped,
    };

}


export default useGame;