// @ts-nocheck
// Supabase Edge Function — analyze-resume (Groq)

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
      temperature: 0.4,
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
    const { fullName, headline, skills, education, experience, targetRole } =
      await req.json();

    const skillsList = Array.isArray(skills) && skills.length > 0
      ? skills.join(", ") : "None listed";
    const expList = Array.isArray(experience) && experience.length > 0
      ? experience.map((e: any) => `${e.role} at ${e.company}`).join("; ")
      : "No experience listed";
    const eduList = Array.isArray(education) && education.length > 0
      ? education.map((e: any) => `${e.degree} from ${e.institution}`).join("; ")
      : "No education listed";

    const system = `You are an expert resume reviewer and career coach for the Indian job market.
You give honest, actionable feedback to help freshers and early-career professionals.
Always respond with ONLY valid JSON, no explanation, no markdown fences.`;

    const user = `Analyse this candidate profile for a ${targetRole || "Software Developer"} role:

Name: ${fullName || "Unknown"}
Headline: ${headline || "Fresher / Student"}
Skills: ${skillsList}
Experience: ${expList}
Education: ${eduList}

Return ONLY this exact JSON structure (fill in real values based on the profile):
{
  "overall_score": 65,
  "grade": "Good",
  "summary": "Two sentence honest summary of this candidate's profile strength.",
  "sections": [
    {"name": "Contact Info",  "score": 85, "status": "good"},
    {"name": "Headline",      "score": 60, "status": "needs_work"},
    {"name": "Skills",        "score": 70, "status": "good"},
    {"name": "Education",     "score": 80, "status": "good"},
    {"name": "Experience",    "score": 45, "status": "needs_work"},
    {"name": "ATS Keywords",  "score": 55, "status": "needs_work"}
  ],
  "strengths": [
    "Specific strength based on their actual skills",
    "Another specific strength",
    "Third specific strength"
  ],
  "improvements": [
    {"issue": "Add a professional summary", "impact": "High", "description": "Specific actionable advice"},
    {"issue": "Include more keywords", "impact": "High", "description": "Specific actionable advice"},
    {"issue": "Quantify achievements", "impact": "Medium", "description": "Specific actionable advice"}
  ],
  "ats_score": 58,
  "ats_issues": [
    {"type": "success", "message": "Specific positive finding"},
    {"type": "warning", "message": "Specific warning"},
    {"type": "error",   "message": "Specific issue to fix"},
    {"type": "success", "message": "Another positive finding"}
  ],
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "top_tip": "The single most impactful thing this candidate can do right now."
}`;

    const raw = await callGroq(system, user);
    const cleaned = extractJSON(raw);
    const analysis = JSON.parse(cleaned);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[analyze-resume] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});