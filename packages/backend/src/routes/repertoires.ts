import { Router } from "express";
import {
  getRepertoires,
  getFullRepertoires,
  downloadRepertoires,
  getRepertoireById,
  downloadRepertoireById,
  createRepertoire,
  duplicateRepertoire,
  getVariantsInfo,
  postVariantsInfo,
  postVariantReview,
  updateRepertoire,
  updateRepertoireName,
  moveRepertoireOrderUp,
  deleteRepertoire,
  disableRepertoire,
  enableRepertoire,
  deleteVariantInfo
} from "../controllers/repertoiresController";

const router = Router();

router.get("/", getRepertoires);
router.get("/full", getFullRepertoires);
router.get("/download", downloadRepertoires);
router.get("/:id", getRepertoireById);
router.get("/:id/download", downloadRepertoireById);
router.post("/", createRepertoire);
router.post("/:id/duplicate", duplicateRepertoire);
router.get("/:id/variantsInfo", getVariantsInfo);
router.post("/:id/variantsInfo", postVariantsInfo);
router.post("/:id/variant-reviews", postVariantReview);
router.delete("/:id/variantsInfo", deleteVariantInfo);
router.put("/:id", updateRepertoire);
router.put("/:id/name", updateRepertoireName);
router.put("/:id/enable", enableRepertoire);
router.put("/:id/disable", disableRepertoire);
router.patch("/:id/order/up", moveRepertoireOrderUp);
router.delete("/:id", deleteRepertoire);

export default router;
