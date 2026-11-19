
const express = require("express");

const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
} = require("../controllers/analysisController");

const router = express.Router();

router.post("/", createAnalysis);
router.get("/", getAnalyses);
router.get("/:id", getAnalysisById);

module.exports = router;
