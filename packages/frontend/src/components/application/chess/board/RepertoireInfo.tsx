import React from "react";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel"
import { MoveVariantNode } from "../../../../models/VariantNode";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";

export const RepertoireInfo = () => {
    const {
        variants,
        currentMoveNode,
        orientation,
        repertoireId,
        repertoireName,
        updateRepertoire,
        chess,
        changeNameMove,
        goToMove,
        deleteMove,
        comment,
        updateComment,
      } = useRepertoireContext();
    
      const { showConfirmDialog, showRepertoireDialog, showSelectVariantsDialog } =
        useDialogContext();
        
    /* return <RepertoireInfoPanel variants={[]} fen={""} currentMoveNode={new MoveVariantNode} goToMove={function (move: MoveVariantNode): void {
        throw new Error("Function not implemented.");
    } } deleteMove={function (move: MoveVariantNode): void {
        throw new Error("Function not implemented.");
    } } changeNameMove={function (move: MoveVariantNode, newName: string): void {
        throw new Error("Function not implemented.");
    } } moves={[]} onSelectVariant={function (): void {
        throw new Error("Function not implemented.");
    } } />; 
    
    <VariantsTree
        variants={variants}
        currentNode={currentMoveNode}
        orientation={orientation}
        deleteVariant={deleteVariant}
        copyVariantToRepertoire={copyVariantToRepertoire}
        copyVariantsToRepertoire={copyVariantsToRepertoire}
        deleteVariants={deleteVariants}
        changeNameMove={changeNameMove}
        deleteMove={deleteMove}
        goToMove={goToMove}
        currentMoveNode={currentMoveNode}
      ></VariantsTree>
    */

    return <RepertoireInfoPanel 
        variants={variants}
        fen={chess.fen()}
        currentMoveNode={currentMoveNode} 
        goToMove={goToMove} 
        deleteMove={deleteMove} 
        changeNameMove={changeNameMove} 
        onSelectVariant={() => {}}
        comment={comment}
        updateComment={updateComment}

    />

}