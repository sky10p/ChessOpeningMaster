import { Color, Move } from "chess.js";
import { MoveVariantNode } from "../VariantNode";

const getMove = (move: string, color: Color = 'w'): Move => {
    return {
        from: move,
        to: move,
        lan: move,
        san: move,
        color: color,
        flags: "b",
        piece: "p",
    } as Move;
};


describe("MoveVariantNode", () => {
  let moveVariantNode: MoveVariantNode;

  beforeEach(() => {
    moveVariantNode = new MoveVariantNode();
  });

  it("should create an initial node with correct properties", () => {
    expect(moveVariantNode.id).toEqual("initial");
    expect(moveVariantNode.move).toBeNull();
    expect(moveVariantNode.children).toEqual([]);
    expect(moveVariantNode.parent).toBeNull();
  });

  it("should add a move to the node and set its properties correctly", () => {
    const move: Move = {
      from: "e2",
      to: "e4",
      lan: "e2e4",
      san: "e4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;

    const newNode = moveVariantNode.addMove(move);

    expect(newNode.move).toEqual(move);
    expect(newNode.parent).toEqual(moveVariantNode);
    expect(newNode.id).toEqual(move.lan);
    expect(moveVariantNode.children).toContain(newNode);
  });

  it("should throw an error when calling getMove() on an initial node", () => {
    expect(() => moveVariantNode.getMove()).toThrow("Move is null");
  });

  it("should return the move when calling getMove() on a node with a move", () => {
    const move: Move = {
      from: "e2",
      to: "e4",
      lan: "e2e4",
      san: "e4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;
    const newNode = moveVariantNode.addMove(move);

    expect(newNode.getMove()).toEqual(move);
  });

  it("should return the correct variants", () => {
    const move1: Move = {
      from: "e2",
      to: "e4",
      lan: "e2e4",
      san: "e4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;
    const move2: Move = {
      from: "d2",
      to: "d4",
      lan: "d2d4",
      san: "d4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;

    moveVariantNode.addMove(move1);
    moveVariantNode.addMove(move2);
    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(2);
    expect(variants[0].moves[0].move).toEqual(move1);
    expect(variants[1].moves[0].move).toEqual(move2);
  });

  it("should return only one variant with several movements", () => {
    const move1: Move = {
      from: "e2",
      to: "e4",
      lan: "e2e4",
      san: "e4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;
    const move2: Move = {
      from: "d2",
      to: "d4",
      lan: "d2d4",
      san: "d4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;

    const newNode = moveVariantNode.addMove(move1);
    newNode.addMove(move2);
    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(1);
    expect(variants[0].moves[0].move).toEqual(move1);
    expect(variants[0].moves[1].move).toEqual(move2);
  });

  it("should return severial variants if some children node has more than one node", () => {
    const move1: Move = {
      from: "e2",
      to: "e4",
      lan: "e2e4",
      san: "e4",
      color: "w",
      flags: "b",
      piece: "p",
    } as Move;
    const move2: Move = {
      from: "d2",
      to: "d4",
      lan: "d2d4",
      san: "d4",
      color: "b",
      flags: "b",
      piece: "p",
    } as Move;

    const move3: Move = {
        from: "c2",
        to: "c4",
        lan: "c2c4",
        san: "c4",
        color: "b",
        flags: "b",
        piece: "p",
      } as Move;

    const firstMove= moveVariantNode.addMove(move1);
    firstMove.addMove(move2);
    firstMove.addMove(move3);
    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(2);
    expect(variants[0].moves[0].move).toEqual(move1);
    expect(variants[0].moves[1].move).toEqual(move2);
    expect(variants[1].moves[0].move).toEqual(move1);
    expect(variants[1].moves[1].move).toEqual(move3);

  });

  it("should return name to variants", () => {
    
    const e4= moveVariantNode.addMove(getMove("e4"));
    const e5 = e4.addMove(getMove("e5"));
    const Cf6 = e5.addMove(getMove("Cf6"));
    const Cc6 = Cf6.addMove(getMove("Cc6"));
    const Bc4 = Cc6.addMove(getMove("Bc4"), "Apertura Italiana");
   
    const Bb5 = Cc6.addMove(getMove("Bb5"), "Apertura Española");
    const d4 = Cc6.addMove(getMove("d4"));
    const exd4 = d4.addMove(getMove("exd4"));
    const Bc4Alt = exd4.addMove(getMove("Bc4"), "Gambito escocés");
    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(3);
    expect(variants[0]).toEqual({
        name: "Apertura Italiana",
        moves: [e4, e5, Cf6, Cc6, Bc4]
    })
    expect(variants[1]).toEqual({
        name: "Apertura Española",
        moves: [e4, e5, Cf6, Cc6, Bb5]
    })
    expect(variants[2]).toEqual({
        name: "Gambito escocés",
        moves: [e4, e5, Cf6, Cc6, d4, exd4, Bc4Alt]
    })
 

  });

  it("should return unique key names for each node", () => {
    
    const e4= moveVariantNode.addMove(getMove("e4", 'w'));
    const e5 = e4.addMove(getMove("e5", 'b'));
    const Cf6 = e5.addMove(getMove("Cf6", 'w'));
    const Cc6 = Cf6.addMove(getMove("Cc6", 'b'));
    const Bc4 = Cc6.addMove(getMove("Bc4", 'w'), "Apertura Italiana");
   
    const Bb5 = Cc6.addMove(getMove("Bb5", 'b'), "Apertura Española");
    const d4 = Cc6.addMove(getMove("d4", 'w'));
    const exd4 = d4.addMove(getMove("exd4", 'b'));
    const Bc4Alt = exd4.addMove(getMove("Bc4"), "Gambito escocés");

    expect(e4.getUniqueKey()).toEqual("1. w#e4");
    expect(e5.getUniqueKey()).toEqual("1. b#e5");
    expect(Cf6.getUniqueKey()).toEqual("2. w#Cf6");
    expect(Cc6.getUniqueKey()).toEqual("2. b#Cc6");
    expect(Bc4.getUniqueKey()).toEqual("3. w#Bc4");

    expect(Bb5.getUniqueKey()).toEqual("3. b#Bb5");

    expect(d4.getUniqueKey()).toEqual("3. w#d4");
    expect(exd4.getUniqueKey()).toEqual("3. b#exd4");
    expect(Bc4Alt.getUniqueKey()).toEqual("4. w#Bc4");

 

  });
});
