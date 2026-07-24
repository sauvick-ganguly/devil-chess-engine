import { useEffect, useState } from "react";
import Piece from "./Piece";

function AnimatedPiece({ piece, from, to, squareSize }) {

    const [transform, setTransform] = useState("translate(0%, 0%)");

    useEffect(() => {
        requestAnimationFrame(() => {
            const dx = (to.col - from.col) * 100;
            const dy = (to.row - from.row) * 100;

            setTransform(`translate(${dx}%, ${dy}%)`);
        });
    }, [from, to]);

    return (
        <div
            className="animated-piece"
            style={{
                left: `${from.col * squareSize}%`,
                top: `${from.row * squareSize}%`,
                transform
            }}
        >
            <Piece piece={piece} />
        </div>
    );
}

export default AnimatedPiece;