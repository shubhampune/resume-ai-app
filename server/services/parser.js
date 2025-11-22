const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractText(filePath, mimeType) {
    const buffer = fs.readFileSync(filePath);

    if (mimeType === 'application/pdf') {
        const data = await pdf(buffer);
        return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else {
        throw new Error('Unsupported file type');
    }
}

async function parseResume(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are an AI Resume Parser. Extract the following information from the resume text below and return it as a JSON object.
    
    Fields to extract:
    - name (string)
    - email (string)
    - phone (string)
    - location (string)
    - skills (array of strings)
    - experience_years (number, total years of experience)
    - education (array of strings, e.g., ["B.Tech in CS", "MBA"])
    
    Resume Text:
    ${text}
    
    Return ONLY the JSON object, no markdown formatting.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    try {
        // Clean up markdown code blocks if present
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse LLM response:", textResponse);
        throw new Error("Failed to parse resume data");
    }
}

module.exports = { extractText, parseResume };
