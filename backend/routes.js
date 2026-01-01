const express = require("express");
const router = express.Router();
const { PR } = require("./prModel");
const { mergePR } = require("./github");

// Instructor dashboard
router.get("/instructor/prs", async (req, res) => {
  const prs = await PR.find({ status: "PENDING_INSTRUCTOR" });
  res.json(prs);
});

// Approve & merge
router.post("/approve/:prNumber", async (req, res) => {
  const prNumber = parseInt(req.params.prNumber);
  const pr = await PR.findOne({ prNumber });

  if (!pr) return res.status(404).json({ error: "PR not found" });
  if (pr.status !== "PENDING_INSTRUCTOR")
    return res.status(400).json({ error: "PR not ready for approval" });

  try {
    const mergeResult = await mergePR(prNumber);
    pr.status = "MERGED";
    await pr.save();
    res.json({ message: "PR approved and merged", mergeResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject
router.post("/reject/:prNumber", async (req, res) => {
  await PR.findOneAndUpdate(
    { prNumber: parseInt(req.params.prNumber) },
    { status: "REJECTED" }
  );
  res.json({ message: "PR rejected" });
});

// Existing endpoint
router.get("/prs", async (req, res) => {
  const prs = await PR.find().sort({ prNumber: -1 });
  res.json(prs);
});

module.exports = router;
