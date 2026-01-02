const axios = require("axios");
require("dotenv").config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPO_OWNER;
const REPO = process.env.GITHUB_REPO_NAME;

if (!GITHUB_TOKEN || !OWNER || !REPO) {
  console.error("❌ GitHub token or repo info missing!");
  process.exit(1);
}

async function mergePR(prNumber) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}/merge`;

  try {
    const response = await axios.put(
      url,
      { merge_method: "merge" }, // or "squash"/"rebase"
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`, // use Bearer
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28", // modern header
        },
      }
    );

    console.log(`✅ PR #${prNumber} merged successfully`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ GitHub merge failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function getPRPatch(prNumber) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}/files`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const files = response.data;
    if (!Array.isArray(files) || files.length === 0) return "";

    let diff = "";
    for (const f of files) {
      if (f.patch) {
        diff += `diff --git a/${f.filename} b/${f.filename}\n${f.patch}\n\n`;
      } else {
        diff += `--- ${f.filename} (no patch available)\n\n`;
      }
    }

    return diff;
  } catch (error) {
    console.error("❌ Failed to fetch PR files:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { mergePR, getPRPatch };
