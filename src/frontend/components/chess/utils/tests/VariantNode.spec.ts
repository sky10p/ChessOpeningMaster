import { Move } from "chess.js";
import { MoveVariantNode } from "../VariantNode";
import { expectVariant } from "./VariantNodes.helpers";

let moveTurn = 'w';

const getMove = (move: string): Move => {

    const currentTurn = moveTurn;
    moveTurn = moveTurn === 'w' ? 'b' : 'w';
    return {
        from: move,
        to: move,
        lan: move,
        san: move,
        color: currentTurn,
        flags: "b",
        piece: "p",
    } as Move;
};


describe("MoveVariantNode", () => {
  let moveVariantNode: MoveVariantNode;

  beforeEach(() => {
    moveVariantNode = new MoveVariantNode();
    moveTurn = 'w';
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
    const Cf3 = e5.addMove(getMove("Cf3"));
    const Cc6 = Cf3.addMove(getMove("Cc6"));
    const Bc4 = Cc6.addMove(getMove("Bc4"), "Apertura Italiana");
   
    moveTurn = 'w'
    const Bb5 = Cc6.addMove(getMove("Bb5"), "Apertura Española");
    const a6 = Bb5.addMove(getMove("a6"));
    moveTurn = 'b'
    const Cf6 = Bb5.addMove(getMove("Cf6"));
    const d4 = Cc6.addMove(getMove("d4"));
    const exd4 = d4.addMove(getMove("exd4"));
    const Bc4Alt = exd4.addMove(getMove("Bc4"), "Gambito escocés");
    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(4);
    expectVariant(variants[0], "Apertura Italiana", [e4, e5, Cf3, Cc6, Bc4])
    expectVariant(variants[1], "Apertura Española (3. ...a6)", [e4, e5, Cf3, Cc6, Bb5, a6])
    expectVariant(variants[2], "Apertura Española (3. ...Cf6)", [e4, e5, Cf3, Cc6, Bb5, Cf6])
    expectVariant(variants[3], "Gambito escocés", [e4, e5, Cf3, Cc6, d4, exd4, Bc4Alt]) 

  });

  it("should return the specified variants when subvariants are deeper", () => {
    const e4 = moveVariantNode.addMove(getMove("e4"));
    const e5 = e4.addMove(getMove("e5"));
    const Nf3 = e5.addMove(getMove("Nf3"));
    const Nc6 = Nf3.addMove(getMove("Nc6"));
    const d4 = Nc6.addMove(getMove("d4"));
    const exd4 = d4.addMove(getMove("exd4"));
    const Bc4 = exd4.addMove(getMove("Bc4"), "Gambito escocés");
    const Bc5 = Bc4.addMove(getMove("Bc5"));
    const c3 = Bc5.addMove(getMove("c3"));
    const dxc3 = c3.addMove(getMove("dxc3"));
    const Bxf7 = dxc3.addMove(getMove("Bxf7+"));
    const Kxf7 = Bxf7.addMove(getMove("Kxf7"));
    const Qd5 = Kxf7.addMove(getMove("Qd5+"));
    const Ke8 = Qd5.addMove(getMove("Ke8"));
    const Qh5 = Ke8.addMove(getMove("Qh5+"));
    const g6 = Qh5.addMove(getMove("g6"));
    const Qxc5 = g6.addMove(getMove("Qxc5"));
    const d6 = Qxc5.addMove(getMove("d6"));
    const Qxc3 = d6.addMove(getMove("Qxc3"));
    const cxb2 = Qxc5.addMove(getMove("cxb2"));
    const Bxb2 = cxb2.addMove(getMove("Bxb2"));

    const variants = moveVariantNode.getVariants();

    expect(variants.length).toEqual(2);
    expectVariant(variants[0], "Gambito escocés (9. ...d6)", [e4, e5, Nf3, Nc6, d4, exd4, Bc4, Bc5, c3, dxc3, Bxf7, Kxf7, Qd5, Ke8, Qh5, g6, Qxc5, d6, Qxc3]);
    expectVariant(variants[1], "Gambito escocés (9. ...cxb2)", [e4, e5, Nf3, Nc6, d4, exd4, Bc4, Bc5, c3, dxc3, Bxf7, Kxf7, Qd5, Ke8, Qh5, g6, Qxc5, cxb2, Bxb2]);
});


  it("should return unique key names for each node", () => {
    
    const e4= moveVariantNode.addMove(getMove("e4"));
    const e5 = e4.addMove(getMove("e5"));
    const Cf6 = e5.addMove(getMove("Cf6"));
    const Cc6 = Cf6.addMove(getMove("Cc6"));
    const Bc4 = Cc6.addMove(getMove("Bc4"), "Apertura Italiana");
   
    const Bb5 = Cc6.addMove(getMove("Bb5"), "Apertura Española");
    const d4 = Cc6.addMove(getMove("d4"));
    const exd4 = d4.addMove(getMove("exd4"));
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

  it("should return string names for each node", () => {
    
    const e4= moveVariantNode.addMove(getMove("e4"));
    const e5 = e4.addMove(getMove("e5"));
    const Cf6 = e5.addMove(getMove("Cf6"));
    const Cc6 = Cf6.addMove(getMove("Cc6"));
    const Bc4 = Cc6.addMove(getMove("Bc4"), "Apertura Italiana");
   
    const Bb5 = Cc6.addMove(getMove("Bb5"), "Apertura Española");
    const d4 = Cc6.addMove(getMove("d4"));
    const exd4 = d4.addMove(getMove("exd4"));
    const Bc4Alt = exd4.addMove(getMove("Bc4"), "Gambito escocés");

    expect(e4.toString()).toEqual("1. e4");
    expect(e5.toString()).toEqual("1. ...e5");
    expect(Cf6.toString()).toEqual("2. Cf6");
    expect(Cc6.toString()).toEqual("2. ...Cc6");
    expect(Bc4.toString()).toEqual("3. Bc4");

    expect(Bb5.toString()).toEqual("3. ...Bb5");

    expect(d4.toString()).toEqual("3. d4");
    expect(exd4.toString()).toEqual("3. ...exd4");
    expect(Bc4Alt.toString()).toEqual("4. Bc4");

 

  });

 
});
