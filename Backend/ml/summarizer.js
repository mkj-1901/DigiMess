// Backend/ml/summarizer.js

let pipeline;

async function initTransformers() {
  if (!pipeline) {
    // Dynamically import to ensure compatibility
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
  }
}

// Cache the pipeline instances to avoid reloading the model for every request
let summarizerPipelineInstance = null;
let sentimentPipelineInstance = null;

async function getSummarizer() {
  await initTransformers();
  if (!summarizerPipelineInstance) {
    // Xenova/distilbart-cnn-6-6 is optimal for fast local summarization
    summarizerPipelineInstance = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
  }
  return summarizerPipelineInstance;
}

async function getSentimentAnalyzer() {
  await initTransformers();
  if (!sentimentPipelineInstance) {
    // Fast sentiment analysis model
    sentimentPipelineInstance = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  }
  return sentimentPipelineInstance;
}

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

    // Combine comments. Truncate if too long to prevent token limit issues.
    const combinedComments = validReviews.map(r => r.comment.trim()).join(". ");
    const truncatedTextForSummary = combinedComments.slice(0, 2000); 

    // Run abstractive summarization inference
    const summarizer = await getSummarizer();
    const summaryResult = await summarizer(truncatedTextForSummary, {
      max_new_tokens: 50,
      min_new_tokens: 10,
    });
    
    // Extracted summary
    let generatedSummary = summaryResult[0]?.summary_text || "Unable to generate abstractive summary.";
    // Capitalize first letter
    generatedSummary = generatedSummary.charAt(0).toUpperCase() + generatedSummary.slice(1);

    // Run sentiment analysis on the text to get overall vibe
    const sentimentAnalyzer = await getSentimentAnalyzer();
    // Sentiment models usually take max 512 tokens
    const truncatedTextForSentiment = combinedComments.slice(0, 1000);
    const sentimentResult = await sentimentAnalyzer(truncatedTextForSentiment);
    const sentimentLabel = sentimentResult[0]?.label || "NEUTRAL";
    
    // Choose appropriate emoji based on the sentiment
    const sentimentEmoji =
      sentimentLabel === "POSITIVE"
        ? "🟢 Positive"
        : sentimentLabel === "NEGATIVE"
        ? "🔴 Negative"
        : "🟡 Mixed";

    // Final formatted output
    return {
      averageRating: parseFloat(avgRating.toFixed(2)),
      summaryText: `${sentimentEmoji}: ${generatedSummary}`,
    };
  } catch (err) {
    console.error("❌ Model inference error:", err);
    return { averageRating: 0, summaryText: "Error generating summary using AI model." };
  }
};
