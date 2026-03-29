// @ts-nocheck
// Supabase Edge Function — career-roadmap (Groq)

const GROQ_KEY = Deno.env.get("GROQ_KEY");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const objStart = raw.indexOf("{");
  if (objStart !== -1) {
    return raw.slice(objStart, raw.lastIndexOf("}") + 1);
  }
  return raw.trim();
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error("GROQ_KEY secret is not set in Supabase");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Groq API error: ${data.error.message}`);

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { skills, experience, education, headline, targetRole } =
      await req.json();

    const skillsList = Array.isArray(skills) && skills.length > 0
      ? skills.join(", ") : "No skills listed";
    const expSummary = Array.isArray(experience) && experience.length > 0
      ? `${experience.length} experience entries` : "No experience";
    const eduSummary = Array.isArray(education) && education.length > 0
      ? education[0]?.degree || "Has education" : "No education listed";

    const system = `You are a senior career coach specialising in the Indian tech job market.
You create personalised, realistic career roadmaps with accurate Indian salary ranges (in LPA).
Always respond with ONLY valid JSON, no explanation, no markdown fences.`;

    const user = `Create a personalised career roadmap for this candidate:

Current Skills: ${skillsList}
Experience: ${expSummary}
Education: ${eduSummary}
Current Level: ${headline || "Fresher / Student"}
Target Role: ${targetRole || "Software Developer"}

Return ONLY this exact JSON structure:
{
  "current_level": "Brief honest description of where they are now",
  "career_score": 62,
  "target_role": "Refined specific target role title",
  "milestones": [
    {
      "id": 1,
      "title": "Junior Frontend Developer",
      "salary": "₹4-6 LPA",
      "experience": "0-1 years",
      "timeline": "Now - 6 months",
      "skills_needed": ["React", "JavaScript ES6+", "Git", "CSS/Tailwind"],
      "description": "Entry-level role building UI components and features",
      "status": "current",
      "progress": 65,
      "tips": ["Build 3 portfolio projects", "Learn Git workflows", "Deploy projects to Vercel"]
    },
    {
      "id": 2,
      "title": "Frontend Developer",
      "salary": "₹6-12 LPA",
      "experience": "1-3 years",
      "timeline": "6 months - 2 years",
      "skills_needed": ["TypeScript", "State Management", "Testing", "Performance"],
      "description": "Mid-level role owning features and working independently",
      "status": "next",
      "progress": 0,
      "tips": ["Learn TypeScript", "Master Redux or Zustand", "Write unit tests"]
    },
    {
      "id": 3,
      "title": "Senior Frontend Developer",
      "salary": "₹12-22 LPA",
      "experience": "3-5 years",
      "timeline": "2-4 years",
      "skills_needed": ["System Design", "Architecture", "Code Review", "Mentoring"],
      "description": "Senior role making technical decisions and mentoring juniors",
      "status": "future",
      "progress": 0,
      "tips": []
    },
    {
      "id": 4,
      "title": "Tech Lead / Staff Engineer",
      "salary": "₹22-40 LPA",
      "experience": "5-8 years",
      "timeline": "4-7 years",
      "skills_needed": ["Cross-team Leadership", "Technical Strategy", "Stakeholder Management"],
      "description": "Leading engineering teams and driving technical vision",
      "status": "future",
      "progress": 0,
      "tips": []
    }
  ],
  "skills_to_develop": [
    {"skill": "TypeScript", "current_level": 20, "importance": "High"},
    {"skill": "Testing",    "current_level": 15, "importance": "High"},
    {"skill": "Node.js",    "current_level": 30, "importance": "Medium"},
    {"skill": "System Design", "current_level": 10, "importance": "Medium"}
  ],
  "alternative_paths": [
    {"title": "Full Stack Developer",        "match": 82},
    {"title": "React Native Developer",      "match": 74},
    {"title": "Frontend Architect",          "match": 65}
  ],
  "ai_insight": "Two to three sentence personalised insight about this specific candidate, what makes them stand out, and what would most accelerate their career given their current skills and background.",
  "learning_recommendations": [
    {"skill": "TypeScript",    "resource": "TypeScript Handbook at typescriptlang.org",      "duration": "8 hours"},
    {"skill": "React Testing", "resource": "Testing Library docs + Kent C. Dodds course",    "duration": "6 hours"},
    {"skill": "System Design", "resource": "System Design Primer on GitHub by donnemartin", "duration": "12 hours"}
  ]
}`;

    const raw = await callGroq(system, user);
    const cleaned = extractJSON(raw);
    const roadmap = JSON.parse(cleaned);

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[career-roadmap] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});