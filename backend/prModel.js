const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));

const PRSchema = new mongoose.Schema({
  prNumber: Number,
  title: String,
  author: String,
  branch: String,

  status: {
    type: String,
    enum: [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "MERGED",
      "CI_PASSED",
      "CI_FAILED"
    ],
    default: "PENDING"
  },

  review: {
    summary: String,
    issues: [String],
    score: Number,
    branchType: String
  }
});

const PR = mongoose.model("PR", PRSchema);

module.exports = {
  PR,

  savePR: async (data) => {
    const pr = new PR(data);
    await pr.save();
    console.log(`PR #${data.prNumber} saved.`);
  },

  updatePR: async (prNumber, update) => {
    await PR.findOneAndUpdate({ prNumber }, { $set: update }, { new: true });
  }
};
