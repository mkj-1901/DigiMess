// Backend/ml/summarizer.js
const ort = require('onnxruntime-node');
ort.env.logLevel = 'fatal';

let pipeline;

async function initTransformers() {
  if (!pipeline) {
    // Dynamically import to ensure compatibility
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
    
    // Silence onnxruntime-node graph optimization warnings
    transformers.env.backends.onnx.logLevel = 'fatal';
    
    // Set cache directory to /tmp for Vercel/Serverless compatibility
    transformers.env.cacheDir = '/tmp';
  }
}

// Cache the pipeline instances to avoid reloading the model for every request
let summarizerPipelineInstance = null;
let sentimentPipelineInstance = null;

async function getSummarizer() {
  await initTransformers();
  if (!summarizerPipelineInstance) {
    // Xenova/distilbart-cnn-6-6 is optimal for fast local summarization
    summarizerPipelineInstance = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
      session_options: { 
        logSeverityLevel: 4, // Suppress C++ warnings (0=Verbose, 4=Fatal)
        graphOptimizationLevel: 'disabled' // Prevents the CleanUnusedInitializersAndNodeArgs warnings
      }
    });
  }
  return summarizerPipelineInstance;
}

async function getSentimentAnalyzer() {
  await initTransformers();
  if (!sentimentPipelineInstance) {
    // Fast sentiment analysis model
    sentimentPipelineInstance = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
      session_options: { 
        logSeverityLevel: 4, // Suppress C++ warnings
        graphOptimizationLevel: 'disabled'
      } 
    });
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

    // Deduplicate comments to prevent the model from looping on "Excellent! Excellent!"
    const uniqueComments = [...new Set(validReviews.map(r => r.comment.trim()))];
    const combinedComments = uniqueComments.join(". ");
    
    // Run sentiment analysis FIRST on the text to get overall vibe
    const sentimentAnalyzer = await getSentimentAnalyzer();
    const truncatedTextForSentiment = combinedComments.slice(0, 1000);
    const sentimentResult = await sentimentAnalyzer(truncatedTextForSentiment);
    const sentimentLabel = sentimentResult[0]?.label || "NEUTRAL";
    
    let generatedSummary = "";
    
    // If the input is too short, abstractive summarization models will hallucinate or regurgitate.
    // Provide a smart fallback instead.
    if (combinedComments.length < 40) {
       generatedSummary = `Students left brief feedback. Overall sentiment appears ${sentimentLabel.toLowerCase()}.`;
    } else {
      const truncatedTextForSummary = combinedComments.slice(0, 1500); 

      // Run abstractive summarization inference
      const summarizer = await getSummarizer();
      const summaryResult = await summarizer(truncatedTextForSummary, {
        max_new_tokens: 50,
        repetition_penalty: 1.5, // Strongly penalize repetition (fixes the "slop" looping)
        no_repeat_ngram_size: 2,
        temperature: 0.5,
        do_sample: false
      });
      
      // Extracted summary
      generatedSummary = summaryResult[0]?.summary_text || "Unable to generate abstractive summary.";
    }
    
    // Capitalize first letter properly and clean up extra spaces
    generatedSummary = generatedSummary.charAt(0).toUpperCase() + generatedSummary.slice(1).trim();
    
    // Ensure the summary doesn't cut off abruptly mid-sentence due to max_new_tokens limit
    const lastPunctuation = Math.max(
      generatedSummary.lastIndexOf('.'), 
      generatedSummary.lastIndexOf('!'), 
      generatedSummary.lastIndexOf('?')
    );
    
    if (lastPunctuation > 0 && lastPunctuation < generatedSummary.length - 1) {
      generatedSummary = generatedSummary.substring(0, lastPunctuation + 1);
    }
    
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
