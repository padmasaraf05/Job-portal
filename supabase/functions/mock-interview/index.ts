// @ts-nocheck
// Supabase Edge Function — mock-interview (Groq)

const GROQ_KEY = Deno.env.get("GROQ_KEY");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile"; // Free, fast, excellent quality

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const arrStart = raw.indexOf("[");
  const objStart = raw.indexOf("{");
  if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
    return raw.slice(arrStart, raw.lastIndexOf("]") + 1);
  }
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
      temperature: 0.7,
      max_tokens: 2048,
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
    const { action, interviewType, jobRole, difficulty, question, answer } =
      await req.json();

    // ── ACTION 1: Generate questions ──────────────────────────
    if (action === "generate_questions") {
      const system = `You are an expert interview coach for the Indian tech job market. 
Always respond with ONLY valid JSON, no explanation, no markdown fences.`;

      const user = `Generate exactly 5 ${interviewType} interview questions for a ${jobRole || "Frontend Developer"} role at ${difficulty || "Medium"} difficulty.

Return ONLY this JSON array:
[
  {
    "id": 1,
    "question": "Tell me about yourself and your experience.",
    "category": "Introduction",
    "difficulty": "${difficulty || "Medium"}",
    "tips": ["Keep it under 2 minutes", "Focus on relevant skills", "End with your goal"]
  }
]`;

      const raw = await callGroq(system, user);
      const cleaned = extractJSON(raw);
      const questions = JSON.parse(cleaned);

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION 2: Score an answer ─────────────────────────────
    if (action === "score_answer") {
      const system = `You are a professional interview coach for the Indian tech industry.
Always respond with ONLY valid JSON, no explanation, no markdown fences.`;

      const user = `Evaluate this interview answer:

Question: ${question}
Candidate's Answer: ${answer}

Return ONLY this JSON object:
{
  "score": 75,
  "overall": "One sentence summary of the answer quality.",
  "strengths": ["Clear communication", "Good structure", "Relevant example"],
  "improvements": ["Add specific metrics", "Slow down delivery"],
  "ideal_answer_hint": "A great answer would include specific examples with measurable outcomes."
}`;

      const raw = await callGroq(system, user);
      const cleaned = extractJSON(raw);
      const feedback = JSON.parse(cleaned);

      return new Response(JSON.stringify({ feedback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[mock-interview] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});