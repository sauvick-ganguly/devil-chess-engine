import { evaluateMaterial } from "./evaluateMaterial";
import { evaluateMobility } from "./evaluateMobility";
import { evaluateCenter } from "./evaluateCenter";
import { evaluateWolf } from "./evaluateWolf";
import { evaluateDevilPrelate } from "./evaluateDevilPrelate";
import { evaluateKingSafety } from "./evaluateKingSafety";
import { evaluatePawnStructure } from "./evaluatePawnStructure";
import { evaluateRook } from "./evaluateRook";

export function evaluatePosition(board,lastMove) {

    let score = 0;
    
    score += evaluateMaterial(board);
    score += evaluateMobility(board,lastMove);
    score += evaluateCenter(board);
    score += evaluateWolf(board);
    score += evaluateDevilPrelate(board);
    score += evaluateKingSafety(board);
    score += evaluatePawnStructure(board);
    score += evaluateRook(board);
    

    return score;
}