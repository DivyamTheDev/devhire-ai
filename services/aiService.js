const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.evaluateProfile = async (profileData) => {
    const { name, bio, skills, githubUsername } = profileData;

    const prompt = `
        Evaluate the following software developer profile for a recruitment platform.
        Provide a technical score from 0 to 100 and a brief constructive feedback (max 3 sentences).
        
        Developer Name: ${name}
        Bio: ${bio}
        Skills: ${skills.join(', ')}
        GitHub: ${githubUsername || 'Not provided'}
        
        Respond ONLY in JSON format like this:
        {
            "score": 85,
            "feedback": "Great focus on backend technologies. Adding more frontend projects could broaden opportunities. Strong use of Node.js."
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an expert technical recruiter and developer advocate." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (err) {
        console.error('AI Evaluation Error:', err);
        throw err;
    }
};
