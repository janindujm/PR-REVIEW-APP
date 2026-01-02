const OpenAI = require("openai");

// Use GitHub PAT token for GitHub Models API
const githubToken = process.env.GITHUB_TOKEN_AI && process.env.GITHUB_TOKEN_AI.trim();
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: githubToken
});

async function reviewCode(diff) {
  if (!githubToken) {
    const msg = "GITHUB_TOKEN is not set or empty";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior software engineer doing a professional code review."
        },
        {
          role: "user",
          content: `Review this pull request diff and give feedback:\n\n${diff}\n\nRespond ONLY with a JSON object with the following keys:\n- summary: short overall summary string\n- issues: array of short issue strings (each item a single issue)\nDo NOT include any additional text outside the JSON.`
        }
      ],
      temperature: 0.2,
      max_tokens: 1024,
      top_p: 1
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("OpenAI returned no content in response:", response);
      return { summary: "", issues: [], score: null };
    }

    // Clean up content: remove triple-backtick fences and try to extract JSON blob
    let cleaned = content.trim();
    // remove surrounding ``` or ```json fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Try to extract the first JSON object-like substring (from first { to last })
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    let parsed = null;
    try {
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(cleaned);
      }
    } catch (err) {
      parsed = null;
    }

    // Try parse JSON response from the model
    try {
      if (parsed === null) {
        // if parsing failed above, try parsing the raw content as a last resort
        parsed = JSON.parse(content);
      }
      // Basic validation
      // Normalize fields: ensure summary string and issues array
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary : String(parsed.summary || ''),
        issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
        score: typeof parsed.score === 'number' ? parsed.score : null
      };
    } catch (err) {
      // Fallback: convert bulleted lines to issues
      const lines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const issues = lines.filter(l => l.startsWith('-') || l.match(/^\d+\./)).map(l => l.replace(/^[-\d\.\s]+/, '').trim());
      return { summary: cleaned, issues: issues.length ? issues : lines.slice(0, 5), score: null };
    }
  } catch (err) {
    // Log full response if available for debugging
    console.error("OpenAI request failed:", err.response?.data || err.message || err);
    throw err;
  }
}

module.exports = { reviewCode };
