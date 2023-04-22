import { IRepertoire } from "../../../../../common/types/Repertoire";
import { MoveVariantNode } from "../VariantNode"
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
        const pgn = toPGN(repertoireToTest.name, new Date(2018,1,1,0,0,0), "white", MoveVariantNode.initMoveVariantNode(testRepertoireMock));
        console.log(pgn);
        expect(pgn).toEqual(repertoirePgn);
    });

    it("should return a pgn string with subvariants", () => {
        const pgn = toPGN(repertoireToTest.name, new Date(2018,1,1,0,0,0), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithSubvariantsMock));
        console.log(pgn);
        expect(pgn).toEqual(repertoireWithSubvariantsPgn);
    });

    it("should return a pgn string with comments", () => {
        const pgn = toPGN(repertoireToTest.name, new Date(2018,1,1,0,0,0), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithCommentsMock));
        console.log(pgn);
        expect(pgn).toEqual(repertoireWithCommentsPgn);
    });
});
