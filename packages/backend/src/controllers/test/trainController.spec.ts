import { NextFunction, Request, Response } from "express";
import { getTrainOpeningSummary } from "../trainController";
import * as trainService from "../../services/trainService";

jest.mock("../../services/trainService");

const mockGetTrainOpening = trainService.getTrainOpening as jest.MockedFunction<
  typeof trainService.getTrainOpening
>;

describe("trainController", () => {
  describe("getTrainOpeningSummary", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockStatus = jest.fn().mockReturnThis();
      mockJson = jest.fn().mockReturnThis();
      mockNext = jest.fn();
      mockRequest = {
        userId: "user-1",
        params: {
          id: "rep-1",
          openingName: "Italian Game",
        },
      };
      mockResponse = {
        status: mockStatus,
        json: mockJson,
      };
    });

    it("uses the decoded route param value directly", async () => {
      const result = { openingName: "100% accuracy" };
      mockRequest.params = {
        id: "rep-1",
        openingName: "100% accuracy",
      };
      mockGetTrainOpening.mockResolvedValue(result as Awaited<ReturnType<typeof trainService.getTrainOpening>>);

      await getTrainOpeningSummary(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetTrainOpening).toHaveBeenCalledWith("user-1", "rep-1", "100% accuracy");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(result);
    });

    it("trims the route param and returns 400 when empty", async () => {
      mockRequest.params = {
        id: "rep-1",
        openingName: "   ",
      };

      await getTrainOpeningSummary(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetTrainOpening).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "openingName is required" });
    });
  });
});
