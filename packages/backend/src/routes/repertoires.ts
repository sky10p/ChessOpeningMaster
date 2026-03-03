import { raw, Router } from "express";
import {
  getRepertoires,
  getFullRepertoires,
  downloadRepertoires,
  restoreRepertoires,
  getRepertoireById,
  downloadRepertoireById,
  createRepertoire,
  duplicateRepertoire,
  getVariantsInfo,
  postVariantsInfo,
  postVariantReview,
  getVariantMistakes,
  postVariantMistakeReview,
  updateRepertoire,
  updateRepertoireName,
  moveRepertoireOrderUp,
  deleteRepertoire,
  disableRepertoire,
  enableRepertoire,
  deleteVariantInfo
} from "../controllers/repertoiresController";

const router: Router = Router();

router.get("/", getRepertoires);
router.get("/full", getFullRepertoires);
router.get("/download", downloadRepertoires);
router.post(
  "/restore",
  raw({
    type: ["application/zip", "application/octet-stream", "application/x-zip-compressed"],
    limit: process.env.BODY_PARSER_LIMIT || "100mb",
  }),
  restoreRepertoires
);
router.get("/:id", getRepertoireById);
router.get("/:id/download", downloadRepertoireById);
router.post("/", createRepertoire);
router.post("/:id/duplicate", duplicateRepertoire);
router.get("/:id/variantsInfo", getVariantsInfo);
router.post("/:id/variantsInfo", postVariantsInfo);
router.post("/:id/variant-reviews", postVariantReview);
router.get("/:id/mistakes", getVariantMistakes);
router.post("/:id/mistake-reviews", postVariantMistakeReview);
router.delete("/:id/variantsInfo", deleteVariantInfo);
router.put("/:id", updateRepertoire);
router.put("/:id/name", updateRepertoireName);
router.put("/:id/enable", enableRepertoire);
router.put("/:id/disable", disableRepertoire);
router.patch("/:id/order/up", moveRepertoireOrderUp);
router.delete("/:id", deleteRepertoire);

export default router;
