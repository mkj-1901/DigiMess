require("dotenv").config();
const axios = require("axios");
const OpenAI = require("openai");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeWithOpenAI(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a restaurant review summarizer. Summarize all reviews in **under 20 words**, keeping it concise and balanced.",
        },
        {
          role: "user",
          content: `Summarize these reviews briefly:\n\n${text}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 50, // tightly limits output length
    });

    // Extract and clean summary
    const summary = response.choices[0].message.content.trim();
    // Ensure it ends neatly
    return summary.replace(/\s*\.$/, "") + ".";
  } catch (error) {
    console.error("❌ OpenAI summarization failed:", error);
    return null;
  }
}

async function summarizeWithHuggingFace(text) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
      {
        inputs: text.slice(0, 2000),
        parameters: { max_length: 40, min_length: 10, do_sample: false },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data?.[0]?.summary_text?.trim() || null;
  } catch (error) {
    console.error("❌ Hugging Face summarization failed:", error.message);
    return null;
  }
}

async function summarizeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      sentiment: "Neutral",
      textSummary: "No reviews available",
    };
  }

  const comments = reviews.map((r) => r.comment || "").filter(Boolean);
  const ratings = reviews.map((r) => r.rating);
  const avgRating = (
    ratings.reduce((a, b) => a + b, 0) / ratings.length
  ).toFixed(2);

  const sentiments = comments.map((c) => sentiment.analyze(c).score);
  const avgSentiment =
    sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  let sentimentLabel = "Neutral";
  if (avgRating <= 2) sentimentLabel = "Negative";
  else if (avgRating > 2 && avgRating <= 3.5) sentimentLabel = "Neutral";
  else sentimentLabel = "Positive";

  const joinedText = comments.join("\n");
  let summary = await summarizeWithOpenAI(joinedText);
  if (!summary) {
    console.log("⚠️ Falling back to Hugging Face summarizer...");
    summary = await summarizeWithHuggingFace(joinedText);
  }

  return {
    totalReviews: reviews.length,
    averageRating: avgRating,
    sentiment: sentimentLabel,
    textSummary: summary || "Summary unavailable",
  };
}

module.exports = { summarizeReviews };