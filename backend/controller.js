const PRModel = require("./prModel");

exports.handleWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  // PR opened
  if (event === "pull_request" && payload.action === "opened") {
    await PRModel.savePR({
      prNumber: payload.pull_request.number,
      title: payload.pull_request.title,
      author: payload.pull_request.user.login,
      status: "PENDING",
    });
  }

  // CI completed
  if (event === "workflow_run" && payload.action === "completed") {
    const prNumber = payload.workflow_run.pull_requests[0]?.number;
    const conclusion = payload.workflow_run.conclusion;

    if (prNumber) {
      await PRModel.updateStatus(
        prNumber,
        conclusion === "success" ? "CI_PASSED" : "CI_FAILED"
      );
    }
  }

  res.sendStatus(200);
};
