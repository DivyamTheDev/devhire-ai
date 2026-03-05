const Groq = require("groq-sdk");
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
 "score": number,
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

module.exports = {
  evaluateProfile,
  summarizeResume
};