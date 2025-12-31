const axios = require('axios');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPO_OWNER;
const REPO = process.env.GITHUB_REPO_NAME;

async function mergePR(prNumber) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}/merge`;
  try {
    const response = await axios.put(
      url,
      { merge_method: "merge" }, // or "squash" / "rebase"
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
}

module.exports = { mergePR };
