const PRModel = require("./prModel");
const { autoReviewPR } = require("./reviewEngine");

exports.handleWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  // PR opened
  if (event === "pull_request" && payload.action === "opened") {
    const pr = payload.pull_request;

    await PRModel.savePR({
      prNumber: pr.number,
      title: pr.title,
      author: pr.user.login,
      branch: pr.head.ref,
      status: "PENDING"
    });

    const feedback = await autoReviewPR({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      prNumber: pr.number,
      branch: pr.head.ref
    });

    await PRModel.updatePR(pr.number, {
      review: feedback,
      status: "PENDING_INSTRUCTOR"
    });
  }

  // CI completed
  if (event === "workflow_run" && payload.action === "completed") {
    const prNumber = payload.workflow_run.pull_requests[0]?.number;
    const conclusion = payload.workflow_run.conclusion;

    if (prNumber) {
      await PRModel.updatePR(prNumber, {
        status: conclusion === "success" ? "CI_PASSED" : "CI_FAILED"
      });
    }
  }

  res.sendStatus(200);
};
