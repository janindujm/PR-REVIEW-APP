const PRModel = require("./prModel");
const { getPRPatch } = require("./github");
const { reviewCode } = require("./openaiService/openaiservice");


async function autoReviewPR({ owner, repo, prNumber, branch }) {
  try {
    const diff = await getPRPatch(prNumber);
    if (!diff) {
      console.warn(`No diff found for PR #${prNumber}`);
      return { summary: "No diff available", issues: [], score: 0 };
    }

    const reviewText = await reviewCode(diff);

    // Store the raw review text in summary for now. Consumers can parse it later.
    return { summary: reviewText, issues: [], score: null };
  } catch (err) {
    console.error("autoReviewPR error:", err.message || err);
    return { summary: `Error generating review: ${err.message || err}`, issues: [], score: 0 };
  }
}


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
      status: "PENDING"
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
