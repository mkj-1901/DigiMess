require("dotenv").config();
const { summarizeReviews } = require("./ml/summarizer");

(async () => {
  console.log("🔑 Loaded key?", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");
  console.log("📂 .env path used:", process.cwd() + "/.env");

  const fakeReviews = [
    { rating: 5, comment: "The food was amazing! Loved every bite!" },
    { rating: 4, comment: "Pretty good, but the rice was a bit dry." },
    { rating: 3, comment: "It was okay, nothing special today." },
    { rating: 2, comment: "The curry was too salty and service was slow." },
    { rating: 5, comment: "Absolutely loved the dessert and friendly staff." },
    { rating: 1, comment: "Terrible experience! Cold food and rude behavior from the waiter." },
    { rating: 4, comment: "Nice ambience, clean tables, but portion size could be larger." },
    { rating: 2, comment: "Overpriced for the quality served. Very disappointed." },
    { rating: 3, comment: "Average food, decent service. Nothing to complain about though." },
    { rating: 5, comment: "Best lunch I’ve had all week! Great flavor and presentation." },
    { rating: 4, comment: "Quick service, good taste, and generous portions." },
    { rating: 1, comment: "Food was undercooked and the place was noisy and messy." },
  ];

  console.log("\n🧠 Running summarization test...");
  const result = await summarizeReviews(fakeReviews);

  console.log("\n✅ Summary result:\n", result);
})();