const PRModel = require("./prModel");
const { getPRPatch } = require("./github");
const { reviewCode } = require("./openaiService/openaiservice");


async function autoReviewPR({ owner, repo, prNumber, branch }) {
  try {
    const diff = await getPRPatch(prNumber);
    if (!diff) {
      console.warn(`autoReviewPR: No diff found for PR #${prNumber}`);
      return { summary: "No diff available", issues: [], score: 0 };
    }

    console.log(`autoReviewPR: PR #${prNumber} diff length=${diff.length}`);

    const reviewText = await reviewCode(diff);
    if (!reviewText) {
      console.warn(`autoReviewPR: OpenAI returned empty review for PR #${prNumber}`);
    } else {
      const preview = reviewText.length > 200 ? reviewText.slice(0, 200) + '...' : reviewText;
      console.log(`autoReviewPR: PR #${prNumber} review length=${reviewText.length} preview=${JSON.stringify(preview)}`);
    }

    // Store the raw review text in summary for now. Consumers can parse it later.
    return { summary: reviewText || "", issues: [], score: null };
  } catch (err) {
    console.error("autoReviewPR error:", err.response?.data || err.message || err);
    return { summary: `Error generating review: ${err.message || err}`, issues: [], score: 0 };
  }
}


exports.handleWebhook = async (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    if (!payload) {
      console.warn("handleWebhook: missing request body", { headers: req.headers });
      return res.status(400).json({ error: "Missing payload" });
    }

    const action = payload?.action;
    console.log(`handleWebhook: event=${event} action=${action}`);

  // PR opened or reopened
  if (event === "pull_request" && (action === "opened" || action === "reopened")) {
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

    // Ensure review fields match the schema types before saving
    const reviewToSave = {
      summary: typeof feedback.summary === "string" ? feedback.summary : JSON.stringify(feedback.summary || ""),
      issues: Array.isArray(feedback.issues) ? feedback.issues.map(String) : [],
      score: typeof feedback.score === "number" ? feedback.score : null
    };

    await PRModel.updatePR(pr.number, {
      review: reviewToSave,
      status: "PENDING"
    });
  }

    // CI completed
    if (event === "workflow_run" && action === "completed") {
      const prNumber = payload.workflow_run.pull_requests[0]?.number;
      const conclusion = payload.workflow_run.conclusion;

      if (prNumber) {
        await PRModel.updatePR(prNumber, {
          status: conclusion === "success" ? "CI_PASSED" : "CI_FAILED"
        });
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("handleWebhook error:", err);
    return res.status(500).json({ error: err.message || "internal error" });
  }
};
