import { NextFunction, Request, Response } from "express";
import { getImportedGames, patchTrainingPlanItem } from "../gamesController";
import * as gameImportService from "../../services/games/gameImportService";

jest.mock("../../services/games/gameImportService");

const mockMarkTrainingPlanItemDone = gameImportService.markTrainingPlanItemDone as jest.MockedFunction<typeof gameImportService.markTrainingPlanItemDone>;
const mockListImportedGames = gameImportService.listImportedGames as jest.MockedFunction<typeof gameImportService.listImportedGames>;

describe("gamesController", () => {
  describe("getImportedGames", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockJson: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockJson = jest.fn().mockReturnThis();
      mockNext = jest.fn();
      mockRequest = {
        userId: "user-1",
        query: {},
      };
      mockResponse = {
        json: mockJson,
      };
      mockListImportedGames.mockResolvedValue([]);
    });

    it("clamps negative limit to 1", async () => {
      mockRequest.query = { limit: "-25" };

      await getImportedGames(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockListImportedGames).toHaveBeenCalledWith("user-1", 1, expect.any(Object));
    });

    it("clamps oversized limit to 500", async () => {
      mockRequest.query = { limit: "100000" };

      await getImportedGames(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockListImportedGames).toHaveBeenCalledWith("user-1", 500, expect.any(Object));
    });
  });

  describe("patchTrainingPlanItem", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let mockSend: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockStatus = jest.fn().mockReturnThis();
      mockJson = jest.fn().mockReturnThis();
      mockSend = jest.fn().mockReturnThis();
      mockNext = jest.fn();
      mockRequest = {
        userId: "user-1",
        params: {
          planId: "plan-1",
          lineKey: "line-1",
        },
      };
      mockResponse = {
        status: mockStatus,
        json: mockJson,
        send: mockSend,
      };
    });

    it("returns 400 when done is not a boolean", async () => {
      mockRequest.body = { done: "false" };

      await patchTrainingPlanItem(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "done must be a boolean" });
      expect(mockMarkTrainingPlanItemDone).not.toHaveBeenCalled();
    });

    it("updates item when done is boolean", async () => {
      mockRequest.body = { done: false };

      await patchTrainingPlanItem(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockMarkTrainingPlanItemDone).toHaveBeenCalledWith("user-1", "plan-1", "line-1", false);
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });
  });
});
