// @ts-nocheck
// Supabase Edge Function — skill-quiz (Groq)
// Generates multiple-choice questions for a given skill

const GROQ_KEY = Deno.env.get("GROQ_KEY");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const arrStart = raw.indexOf("[");
  if (arrStart !== -1) return raw.slice(arrStart, raw.lastIndexOf("]") + 1);
  return raw.trim();
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error("GROQ_KEY secret is not set");

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
      temperature: 0.6,
      max_tokens:  3000,
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
    const { skill, difficulty, count = 10 } = await req.json();

    if (!skill) {
      return new Response(JSON.stringify({ error: "skill is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are an expert technical interviewer and skill assessor for the Indian tech job market.
Generate precise, unambiguous multiple-choice questions to test real knowledge.
Always respond with ONLY valid JSON array, no explanation, no markdown fences.`;

    const user = `Generate exactly ${count} multiple-choice questions to assess "${skill}" skills at ${difficulty || "Intermediate"} level.

Rules:
- Questions must test real practical knowledge, not trivia
- Each question has exactly 4 options
- Only ONE option is correct
- Include a brief explanation for the correct answer
- Mix conceptual and practical questions
- For programming skills include code-based questions

Return ONLY this JSON array (no other text):
[
  {
    "id": 1,
    "question": "Which method is used to add an element to the end of an array in JavaScript?",
    "options": ["push()", "append()", "add()", "insert()"],
    "correct": 0,
    "explanation": "push() adds one or more elements to the end of an array and returns the new length."
  },
  {
    "id": 2,
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct": 1,
    "explanation": "..."
  }
]

Generate all ${count} questions for skill: ${skill} at ${difficulty || "Intermediate"} level.`;

    const raw       = await callGroq(system, user);
    const cleaned   = extractJSON(raw);
    const questions = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format returned");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[skill-quiz] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});