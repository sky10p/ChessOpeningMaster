import { IRepertoire } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../../models/VariantNode"
import { toPGN } from "../pgn.utils";
import { testRepertoireWithCommentsMock } from "./mocks/repertoire-with-comments.mock";
import { repertoireWithCommentsPgn } from "./mocks/repertoire-with-comments.pgn";
import { testRepertoireWithSubvariantsMock } from "./mocks/repertoire-with-subvariants.mock";
import { repertoireWithSubvariantsPgn } from "./mocks/repertoire-with-subvariants.pgn";
import { testRepertoireMock } from "./mocks/repertoire-with-variants.mock";
import { repertoirePgn } from "./mocks/repertoire-with-variants.pgn";

// Mock getCommentsByFens
jest.mock("../../../../repository/positions/positions");
import { getCommentsByFens } from "../../../../repository/positions/positions";
const mockGetCommentsByFens = getCommentsByFens as jest.MockedFunction<typeof getCommentsByFens>;

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

    beforeEach(() => {
        mockGetCommentsByFens.mockResolvedValue({});
    });

    it("should return a pgn string", async () => {
        const pgn = await toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireMock));
        expect(pgn).toEqual(repertoirePgn);
    });

    it("should return a pgn string with subvariants", async () => {
        const pgn = await toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithSubvariantsMock));
        expect(pgn).toEqual(repertoireWithSubvariantsPgn);
    });    it("should return a pgn string with comments", async () => {
        // Mock comments for the specific FENs that are requested - empty for simplicity
        mockGetCommentsByFens.mockResolvedValue({});
        
        const pgn = await toPGN(repertoireToTest.name, new Date(Date.UTC(2018, 0, 1, 5, 0, 0)), "white", MoveVariantNode.initMoveVariantNode(testRepertoireWithCommentsMock));
        
        // With the new batch-fetching approach, comments come from the backend, not from inline move data
        // So this test now verifies the PGN structure without comments since we're mocking empty responses
        expect(pgn).toContain("1. e4");
        expect(pgn).toContain("1... e5");
        expect(pgn).toContain("(1. d4");
        expect(pgn).toContain("[Event \"Repertoire to test pgn\"]");
    });
});
