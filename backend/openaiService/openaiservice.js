const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function reviewCode(diff) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a senior software engineer doing a professional code review."
      },
      {
        role: "user",
        content: `Review this pull request diff and give feedback:\n\n${diff}`
      }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { reviewCode };
