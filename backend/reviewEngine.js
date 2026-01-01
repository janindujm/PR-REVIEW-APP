const axios = require("axios");
const rules = require("./branchRules");

const headers = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
};

function getBranchType(branchName) {
  return branchName.split("/")[0];
}

async function autoReviewPR({ owner, repo, prNumber, branch }) {
  const branchType = getBranchType(branch);
  const rule = rules[branchType];

  if (!rule) {
    return {
      summary: "No branch rules found",
      issues: [],
      score: 100
    };
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
  const res = await axios.get(url, { headers });

  const files = res.data;
  const issues = [];
  let score = 100;

  if (files.length > rule.maxFiles) {
    issues.push(`Too many files changed (${files.length}). Max allowed: ${rule.maxFiles}`);
    score -= 20;
  }

  if (rule.requireTests) {
    const hasTests = files.some(f =>
      f.filename.toLowerCase().includes("test")
    );
    if (!hasTests) {
      issues.push("Test files are required but missing");
      score -= 30;
    }
  }

  return {
    summary: issues.length === 0
      ? "PR passed automatic review"
      : "PR has review issues",
    issues,
    score,
    branchType
  };
}

module.exports = { autoReviewPR };
