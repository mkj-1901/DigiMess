const { summarizeReviews } = require('./ml/summarizer.js');

async function test() {
  console.log("Loading models and testing summarizer...");
  const reviews = [
    { rating: 5, comment: "The food was absolutely delicious and fresh today. Loved the paneer." },
    { rating: 4, comment: "Good taste, but a bit too oily." },
    { rating: 5, comment: "Excellent meal! Really enjoyed the dessert." },
    { rating: 2, comment: "The rotis were cold and stale." }
  ];
  
  const start = Date.now();
  const result = await summarizeReviews(reviews);
  const end = Date.now();
  
  console.log("Summary result:", result);
  console.log(`Time taken: ${(end - start) / 1000}s`);
}

test();
