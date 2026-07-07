const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load .env.local key manually
const envPath = path.join(__dirname, "../.env.local");
let apiKey = "";

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error("Failed to read .env.local:", e.message);
}

if (!apiKey) {
  console.error("GEMINI_API_KEY is empty!");
  process.exit(1);
}

console.log("Using API Key:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);
// Using available model: gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    const result = await model.generateContent("Hello, respond in one word.");
    console.log("SUCCESS! Response:", result.response.text());
  } catch (error) {
    console.error("GEMINI API CALL FAILED!");
    console.error("Error Code/Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Full Error Object:", error);
  }
}

run();
