const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));


const PRSchema = new mongoose.Schema({
  prNumber: Number,
  title: String,
  author: String,
  status: String,
});

const PR = mongoose.model("PR", PRSchema);

exports.savePR = async (data) => {
  const pr = new PR(data);
  await pr.save();
  console.log(`PR #${data.prNumber} saved.`);
};

exports.updateStatus = async (prNumber, status) => {
  await PR.findOneAndUpdate({ prNumber }, { status });
  console.log(`PR #${prNumber} status updated to ${status}.`);
};
