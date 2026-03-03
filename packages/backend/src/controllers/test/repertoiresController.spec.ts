import AdmZip from "adm-zip";
import { NextFunction, Request, Response } from "express";
import { downloadRepertoires, restoreRepertoires } from "../repertoiresController";
import * as userBackupService from "../../services/userBackupService";
import * as userRestoreService from "../../services/userRestoreService";

jest.mock("../../services/userBackupService");
jest.mock("../../services/userRestoreService");

type MockRequest = Partial<Request & { userId: string }>;

const mockGetUserBackupFiles = userBackupService.getUserBackupFiles as jest.MockedFunction<
  typeof userBackupService.getUserBackupFiles
>;
const mockRestoreUserBackup = userRestoreService.restoreUserBackup as jest.MockedFunction<
  typeof userRestoreService.restoreUserBackup
>;

describe("repertoiresController", () => {
  describe("downloadRepertoires", () => {
    let mockRequest: MockRequest;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockSetHeader: jest.Mock;
    let mockSend: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers().setSystemTime(new Date("2026-03-03T12:00:00.000Z"));
      mockRequest = { userId: "507f1f77bcf86cd799439011" };
      mockSetHeader = jest.fn();
      mockSend = jest.fn();
      mockNext = jest.fn();
      mockResponse = {
        setHeader: mockSetHeader,
        send: mockSend,
      };
      mockGetUserBackupFiles.mockResolvedValue([
        {
          fileName: "users.json",
          jsonValue: [
            {
              _id: "507f1f77bcf86cd799439011",
              username: "alice",
              passwordHash: "hash",
              passwordSalt: "salt",
            },
          ],
        },
        { fileName: "repertoires.json", jsonValue: [{ _id: "rep-1", userId: "507f1f77bcf86cd799439011" }] },
        { fileName: "studies.json", jsonValue: [] },
        { fileName: "variantsInfo.json", jsonValue: [] },
        { fileName: "positions.json", jsonValue: [] },
        { fileName: "variantReviewHistory.json", jsonValue: [] },
        { fileName: "variantMistakes.json", jsonValue: [] },
        {
          fileName: "linkedGameAccounts.json",
          jsonValue: [{ provider: "lichess", tokenEncrypted: "encrypted-token" }],
        },
        { fileName: "importedGames.json", jsonValue: [] },
        { fileName: "trainingPlans.json", jsonValue: [] },
      ]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("exports all expected backup files in a zip for the current user", async () => {
      await downloadRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetUserBackupFiles).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(mockSetHeader).toHaveBeenCalledWith(
        "Content-disposition",
        "attachment; filename=chess-openings-backup-2026-03-03.zip"
      );
      expect(mockSetHeader).toHaveBeenCalledWith("Content-type", "application/zip");
      expect(mockSend).toHaveBeenCalledTimes(1);

      const zip = new AdmZip(mockSend.mock.calls[0][0] as Buffer);
      const entryNames = zip.getEntries().map((entry) => entry.entryName).sort();

      expect(entryNames).toEqual([
        "importedGames.json",
        "linkedGameAccounts.json",
        "positions.json",
        "repertoires.json",
        "studies.json",
        "trainingPlans.json",
        "users.json",
        "variantMistakes.json",
        "variantReviewHistory.json",
        "variantsInfo.json",
      ]);
    });

    it("preserves stored encrypted linked-account secrets in the zip", async () => {
      await downloadRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      const zip = new AdmZip(mockSend.mock.calls[0][0] as Buffer);
      const linkedAccounts = JSON.parse(zip.readAsText("linkedGameAccounts.json"));

      expect(linkedAccounts).toEqual([
        {
          provider: "lichess",
          tokenEncrypted: "encrypted-token",
        },
      ]);
    });

    it("does not include auth tokens in the zip", async () => {
      await downloadRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      const zip = new AdmZip(mockSend.mock.calls[0][0] as Buffer);
      const entryNames = zip.getEntries().map((entry) => entry.entryName);

      expect(entryNames).not.toContain("authTokens.json");
    });

    it("passes service errors to next", async () => {
      const error = new Error("backup failed");
      mockGetUserBackupFiles.mockRejectedValue(error);

      await downloadRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("restoreRepertoires", () => {
    let mockRequest: MockRequest;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockRequest = {
        userId: "507f1f77bcf86cd799439011",
        body: Buffer.from("zip-bytes"),
      };
      mockStatus = jest.fn().mockReturnThis();
      mockJson = jest.fn().mockReturnThis();
      mockNext = jest.fn();
      mockResponse = {
        status: mockStatus,
        json: mockJson,
      };
      mockRestoreUserBackup.mockResolvedValue({
        userId: "507f1f77bcf86cd799439011",
        restoredCounts: {
          users: 1,
          repertoires: 1,
        },
      });
    });

    it("restores a backup zip for the current user", async () => {
      await restoreRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRestoreUserBackup).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        Buffer.from("zip-bytes")
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        userId: "507f1f77bcf86cd799439011",
        restoredCounts: {
          users: 1,
          repertoires: 1,
        },
      });
    });

    it("returns 400 when request body is not a zip buffer", async () => {
      mockRequest.body = undefined;

      await restoreRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "Backup zip file is required" });
      expect(mockRestoreUserBackup).not.toHaveBeenCalled();
    });

    it("passes restore service errors to next", async () => {
      const error = new Error("restore failed");
      mockRestoreUserBackup.mockRejectedValue(error);

      await restoreRepertoires(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
