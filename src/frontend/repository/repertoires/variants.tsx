import { IRepertoire } from "../../../common/types/Repertoire";
import { Variant } from "../../components/chess/models/chess.models";
import { MoveVariantNode } from "../../components/chess/utils/VariantNode";
import { putRepertoire } from "./repertoires";
import { variantsToMoves } from "../../components/chess/utils/VariantUtils";


export const deleteVariant = async (repertoire: IRepertoire, variant: Variant) => {
    const repertoireId = repertoire._id;
    const repertoireName = repertoire.name;
    const orientation = repertoire.orientation;
    const moveNode = repertoire.moveNodes;
    const moveVariantsNode = MoveVariantNode.initMoveVariantNode(moveNode);
    const variants = moveVariantsNode.getVariants();
    const variantsWithoutDeleted = variants.filter((v) => v.fullName !== variant.fullName);
    const moveNodeWithoutVariant =variantsToMoves(variantsWithoutDeleted);
    putRepertoire(repertoireId, repertoireName, moveNodeWithoutVariant.getMoveNodeWithoutParent(), orientation);
}

