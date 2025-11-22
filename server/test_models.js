const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // For some versions of the SDK, listModels might be on the client or a specific manager
        // But typically we can try to just use a known model or check documentation.
        // Actually, the SDK doesn't always expose listModels directly on the main class easily in all versions.
        // Let's try a simple generation with 'gemini-pro' to see if that works as a fallback.

        console.log("Testing gemini-1.5-flash...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello");
            console.log("gemini-1.5-flash works!");
        } catch (e) {
            console.log("gemini-1.5-flash failed:", e.message);
        }

        console.log("Testing gemini-1.5-flash-001...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const result = await model.generateContent("Hello");
            console.log("gemini-1.5-flash-001 works!");
        } catch (e) {
            console.log("gemini-1.5-flash-001 failed:", e.message);
        }

        console.log("Testing gemini-pro...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("gemini-pro works!");
        } catch (e) {
            console.log("gemini-pro failed:", e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
