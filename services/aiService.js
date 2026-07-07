const Groq = require("groq-sdk");
const pdfParse = require('pdf-parse');
const fs = require('fs');
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function evaluateProfile(profileData) {

  const { name, bio, skills, githubUsername } = profileData;

  const prompt = `
Evaluate the following developer profile.

Name: ${name}
Bio: ${bio}
Skills: ${skills.join(", ")}
Github: ${githubUsername || "Not provided"}

Return JSON:

{
 "score": number (0 to 100),
 "feedback": "short recruiter feedback"
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  const content = response.choices[0].message.content;
   try {

    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
    return parsed;

  } catch (error) {

    console.error("AI JSON parse failed:", content);

    return {
      score: 70,
      feedback: "AI evaluation succeeded but parsing failed."
    };
}
}


async function summarizeResume(skills, bio) {

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
Summarize this developer in 2 sentences for a recruiter.

Bio: ${bio}
Skills: ${skills.join(", ")}
`
      }
    ]
  });

  return response.choices[0].message.content;
}
async function analyzeResume(dataBuffer) {

  let resumeText = "";
  try {
    const pdfData = await pdfParse(dataBuffer);
    resumeText = pdfData.text;
  } catch (err) {
    console.error("PDF Parsing failed or unsupported file format:", err);
    resumeText = "Could not extract resume text from document buffer. Perform evaluation based on other available fields.";
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
Analyze this resume and return JSON:

{
 "score": number (0 to 100),
 "summary": "short summary",
 "strengths": "strengths",
 "weakness": "weak areas"
}

Resume:
${resumeText}
`
      }
    ]
  });

   const content = response.choices[0].message.content;

  try {
    return JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
  } catch (err) {
    console.error("AI JSON parse failed:", content);

    return {
      score: 70,
      summary: "AI analysis completed but parsing failed."
    };
  }
}

async function matchCandidate(jobDescription, skills) {

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
Job description:
${jobDescription}

Candidate skills:
${skills.join(", ")}

Return JSON:

{
 "matchScore": number (0 to 100),
 "reason": "short explanation"
}
`
      }
    ]
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
  } catch {
    return {
      matchScore: 70,
      reason: "AI analysis completed but parsing failed"
    };
  }
}

module.exports = {
  evaluateProfile,
  summarizeResume,
  analyzeResume,
  matchCandidate
};