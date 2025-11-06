// Backend/ml/summarizer.js

exports.summarizeReviews = async (reviews = []) => {
  try {
    // Filter valid reviews
    const validReviews = reviews.filter(
      (r) => r && typeof r.comment === "string" && r.comment.trim().length > 0
    );

    if (!validReviews.length) {
      return {
        averageRating: 0,
        summaryText: "No valid comments available to summarize.",
      };
    }

    // Compute average rating
    const avgRating =
      validReviews.reduce((s, r) => s + (r.rating || 0), 0) /
      validReviews.length;

    // Define keyword categories
    const keywords = {
      positive: [
        "good",
        "tasty",
        "nice",
        "great",
        "excellent",
        "delicious",
        "amazing",
        "fresh",
      ],
      negative: [
        "bad",
        "poor",
        "oily",
        "cold",
        "stale",
        "horrible",
        "worst",
        "bland",
      ],
      neutral: ["average", "okay", "fine", "decent", "normal"],
    };

    // Count keyword mentions
    const counts = { positive: 0, negative: 0, neutral: 0 };
    const wordFreq = {};

    validReviews.forEach((r) => {
      const words = r.comment.toLowerCase().match(/\b[a-z]+\b/g) || [];
      words.forEach((w) => {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
        for (const [cat, list] of Object.entries(keywords)) {
          if (list.includes(w)) counts[cat]++;
        }
      });
    });

    // Determine dominant sentiment
    const dominant =
      counts.positive > counts.negative && counts.positive >= counts.neutral
        ? "positive"
        : counts.negative > counts.positive && counts.negative >= counts.neutral
        ? "negative"
        : "neutral";

    // Select emoji label
    const sentimentEmoji =
      dominant === "positive"
        ? "🟢 Positive"
        : dominant === "negative"
        ? "🔴 Negative"
        : "🟡 Mixed";

    // Extract top 3 frequent words to make summary dynamic
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w)
      .join(", ") || "varied";

    // Dynamic summary templates
    const templates = {
      positive: [
        `Students frequently used words like ${topWords} to describe their meal, showing high satisfaction.`,
        `Overall sentiment was positive, with mentions of ${topWords} reflecting students' enjoyment.`,
        `Feedback highlighted ${topWords}, indicating that most students were pleased with the meal quality.`,
      ],
      neutral: [
        `Feedback was balanced, with words such as ${topWords} suggesting a mix of likes and dislikes.`,
        `Students had mixed opinions — comments mentioned ${topWords}, indicating room for improvement.`,
        `Overall, responses were moderate with mentions like ${topWords}, showing an average experience.`,
      ],
      negative: [
        `Many reviews included negative terms like ${topWords}, indicating dissatisfaction among students.`,
        `Students criticized the meal, using words such as ${topWords} to describe poor quality.`,
        `The overall tone was negative, with ${topWords} appearing often in feedback.`,
      ],
    };

    // Choose one randomly for freshness
    const summary =
      templates[dominant][
        Math.floor(Math.random() * templates[dominant].length)
      ];

    const keywordSummary = `(${counts.positive} positive, ${counts.neutral} neutral, ${counts.negative} negative mentions)`;

    // Final formatted output
    return {
      averageRating: parseFloat(avgRating.toFixed(2)),
      summaryText: `${sentimentEmoji}: ${summary} ${keywordSummary}`,
    };
  } catch (err) {
    console.error("❌ Keyword summarization error:", err);
    return { averageRating: 0, summaryText: "Error generating summary." };
  }
};
