const fs = require("fs");
const path = require("path");

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

async function list() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", response.status);
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Failed to fetch models list:", error);
  }
}

list();
