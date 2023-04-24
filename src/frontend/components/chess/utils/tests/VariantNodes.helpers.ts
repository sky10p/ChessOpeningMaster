import { Variant } from "../../models/chess.models";
import { MoveVariantNode } from "../VariantNode";

export const expectVariant = (variant: Variant, name: string, moves: MoveVariantNode[]) => {
  expect(variant.fullName).toEqual(name);
  expect(variant.moves.length).toEqual(moves.length);
  variant.moves.forEach((move) => {
    expect(move.getMoveNodeWithoutParent()).toEqual(expect.objectContaining(move.getMoveNodeWithoutParent()));
  });
}