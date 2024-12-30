import { IRepertoire } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../../models/VariantNode"
import { toPGN } from "../pgn.utils";
import { testRepertoireWithCommentsMock } from "./mocks/repertoire-with-comments.mock";
import { repertoireWithCommentsPgn } from "./mocks/repertoire-with-comments.pgn";
import { testRepertoireWithSubvariantsMock } from "./mocks/repertoire-with-subvariants.mock";
import { repertoireWithSubvariantsPgn } from "./mocks/repertoire-with-subvariants.pgn";
import { testRepertoireMock } from "./mocks/repertoire-with-variants.mock";
import { repertoirePgn } from "./mocks/repertoire-with-variants.pgn";


describe("Pgn test utils", () => {
    let repertoireToTest: IRepertoire;

    beforeAll(() => {
        repertoireToTest = {
            _id: "1",
            name: "Repertoire to test pgn",
            moveNodes: testRepertoireMock,
            orientation: "white",
            order: 1
        };

    });

    it("should return a pgn string", () => {
        const pgn = toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireMock));
        expect(pgn).toEqual(repertoirePgn);
    });

    it("should return a pgn string with subvariants", () => {
        const pgn = toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithSubvariantsMock));
        expect(pgn).toEqual(repertoireWithSubvariantsPgn);
    });

    it("should return a pgn string with comments", () => {
        const pgn = toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithCommentsMock));
        expect(pgn).toEqual(repertoireWithCommentsPgn);
    });
});
