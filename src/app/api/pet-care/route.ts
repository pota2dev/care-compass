import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  petName: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  ageYears: z.number().min(0),
  ageMonths: z.number().min(0).max(11),
  weightKg: z.number().min(0),
  gender: z.string(),
  activityLevel: z.enum(["LOW", "MODERATE", "HIGH"]),
  healthIssues: z.string().optional(),
  dietaryNeeds: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    petName,
    species,
    breed,
    ageYears,
    ageMonths,
    weightKg,
    gender,
    activityLevel,
    healthIssues,
    dietaryNeeds,
  } = parsed.data;

  const ageText =
    ageYears > 0
      ? `${ageYears} year${ageYears !== 1 ? "s" : ""}${ageMonths > 0 ? ` and ${ageMonths} months` : ""}`
      : `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;

  const activityText = {
    LOW: "low activity",
    MODERATE: "moderate activity",
    HIGH: "high activity",
  }[activityLevel];

  const prompt = `You are a professional veterinary pet care advisor. Generate a detailed, personalized daily care routine for the following pet:

Pet Details:
- Name: ${petName}
- Species: ${species}
- Breed: ${breed ?? "Mixed/Unknown"}
- Age: ${ageText}
- Weight: ${weightKg} kg
- Gender: ${gender}
- Activity Level: ${activityText}
${healthIssues ? `- Health Issues/Conditions: ${healthIssues}` : ""}
${dietaryNeeds ? `- Dietary Needs/Preferences: ${dietaryNeeds}` : ""}

Generate a comprehensive daily care routine with EXACTLY this JSON structure. Return ONLY valid JSON, no markdown, no explanation:

{
  "summary": "A 2-3 sentence personalized overview about ${petName}",
  "feeding": {
    "mealsPerDay": 2,
    "portionSize": "amount per meal",
    "recommendedFood": "specific food type/brand recommendations",
    "feedingTimes": ["7:00 AM", "6:00 PM"],
    "tips": ["tip1", "tip2", "tip3"],
    "avoid": ["food to avoid 1", "food to avoid 2"]
  },
  "exercise": {
    "dailyMinutes": 60,
    "sessions": 2,
    "activities": ["activity1", "activity2", "activity3"],
    "tips": ["tip1", "tip2"],
    "warning": "any exercise warnings based on age/health or empty string"
  },
  "grooming": {
    "brushingFrequency": "daily or weekly etc",
    "bathingFrequency": "monthly etc",
    "nailTrimming": "frequency",
    "earCleaning": "frequency",
    "dentalCare": "frequency and method",
    "tips": ["tip1", "tip2"]
  },
  "health": {
    "vaccinations": ["vaccine schedule info"],
    "deworming": "schedule",
    "fleaTick": "prevention schedule",
    "vetVisits": "recommended frequency",
    "watchFor": ["symptom1", "symptom2", "symptom3"]
  },
  "mental": {
    "enrichmentActivities": ["activity1", "activity2", "activity3"],
    "socialNeeds": "description",
    "trainingTips": ["tip1", "tip2"]
  },
  "dailySchedule": [
    { "time": "7:00 AM", "activity": "Morning feeding", "duration": "15 min" },
    { "time": "8:00 AM", "activity": "Morning walk", "duration": "30 min" }
  ],
  "urgentAdvice": "any urgent advice based on health issues if provided, or empty string"
}`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "Failed to generate recommendations" },
        { status: 500 },
      );
    }

    const groqData = await response.json();
    const text = groqData.choices[0]?.message?.content ?? "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json(
        { error: "Failed to parse recommendations" },
        { status: 500 },
      );
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ recommendations, petName, species });
  } catch (err) {
    console.error("Pet care recommendation error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 },
    );
  }
}
