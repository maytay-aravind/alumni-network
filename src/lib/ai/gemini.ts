import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CAREER_ROADMAP_PROMPT,
  RESUME_ANALYSIS_PROMPT,
  MENTOR_MATCH_PROMPT,
  SKILL_GAP_PROMPT,
  CAREER_INSIGHTS_PROMPT,
  CAREER_CHAT_PROMPT,
  CAREER_READINESS_PROMPT,
} from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_NAME = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

async function callGemini(prompt: string): Promise<string> {
  let model;
  try {
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
  } catch {
    model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function extractJSON(text: string): any {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(text.substring(firstBrace, lastBrace + 1));
  }
  return JSON.parse(text);
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  steps: {
    title: string;
    description: string;
    resources: { title: string; url: string; type: string }[];
    estimated_hours: number;
    priority: string;
  }[];
}

export interface CareerRoadmap {
  roadmap: RoadmapPhase[];
  total_estimated_weeks: number;
  key_milestones: string[];
  tips: string[];
}

export async function generateCareerRoadmap(
  goal: string,
  currentSkills: string[]
): Promise<CareerRoadmap> {
  const prompt = CAREER_ROADMAP_PROMPT.replace("{goal}", goal).replace(
    "{skills}",
    currentSkills.join(", ")
  );
  const raw = await callGemini(prompt);
  return extractJSON(raw);
}

export interface ResumeAnalysis {
  overall_score: number;
  breakdown: Record<string, number>;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  skill_match: {
    technical: string[];
    soft: string[];
    missing_critical: string[];
  };
  summary: string;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const prompt = RESUME_ANALYSIS_PROMPT.replace("{resumeText}", resumeText);
  const raw = await callGemini(prompt);
  return extractJSON(raw);
}

export interface MentorMatch {
  alumni_id: string;
  alumni_name: string;
  match_score: number;
  match_reasons: string[];
  expertise_alignment: string;
  mentorship_style: string;
}

export async function matchMentors(
  studentProfile: {
    name: string;
    careerGoal: string;
    skills: string[];
    industryInterest: string;
    learningGoals: string[];
  },
  alumniProfiles: any[]
): Promise<{ matches: MentorMatch[] }> {
  const alumniList = alumniProfiles
    .map(
      (a) =>
        `- ID: ${a.id}, Name: ${a.first_name} ${a.last_name}, Company: ${a.current_company}, Position: ${a.current_position}, Industry: ${a.industry}, Skills: ${a.skills?.join(", ")}, About: ${a.about}`
    )
    .join("\n");

  const prompt = MENTOR_MATCH_PROMPT.replace("{studentName}", studentProfile.name)
    .replace("{careerGoal}", studentProfile.careerGoal)
    .replace("{studentSkills}", studentProfile.skills.join(", "))
    .replace("{industryInterest}", studentProfile.industryInterest)
    .replace("{learningGoals}", studentProfile.learningGoals.join(", "))
    .replace("{alumniList}", alumniList);

  const raw = await callGemini(prompt);
  return extractJSON(raw);
}

export interface SkillGapAnalysis {
  match_percentage: number;
  current_skills: { name: string; relevance: string; proficiency: string }[];
  required_skills: {
    name: string;
    importance: string;
    current_level: string;
  }[];
  missing_skills: {
    name: string;
    importance: string;
    difficulty_to_learn: string;
    estimated_time: string;
  }[];
  learning_path: {
    order: number;
    skill: string;
    why: string;
    how_to_learn: string;
    resources: { title: string; url: string; type: string }[];
  }[];
  recommendations: string[];
}

export async function analyzeSkillGap(
  currentSkills: string[],
  targetCareer: string
): Promise<SkillGapAnalysis> {
  const prompt = SKILL_GAP_PROMPT.replace(
    "{currentSkills}",
    currentSkills.join(", ")
  ).replace("{targetCareer}", targetCareer);
  const raw = await callGemini(prompt);
  return extractJSON(raw);
}

export interface CareerInsight {
  category: string;
  title: string;
  description: string;
  data_points: string[];
  recommendation: string;
  impact: string;
}

export interface CareerInsightsResult {
  insights: CareerInsight[];
  top_industries: { name: string; growth: string; avg_salary: string }[];
  in_demand_skills: {
    skill: string;
    demand_level: string;
    trend: string;
  }[];
  career_paths: {
    path: string;
    avg_timeline: string;
    key_skills: string[];
  }[];
}

export async function generateCareerInsights(
  alumniData: any[]
): Promise<CareerInsightsResult> {
  const alumniStr = JSON.stringify(alumniData.slice(0, 50), null, 2);
  const prompt = CAREER_INSIGHTS_PROMPT.replace("{alumniData}", alumniStr);
  const raw = await callGemini(prompt);
  return extractJSON(raw);
}

export async function careerChat(
  message: string,
  context?: { role: string; content: string }[]
): Promise<string> {
  const contextStr = context
    ? context.map((c) => `${c.role}: ${c.content}`).join("\n")
    : "No previous context.";
  const prompt = CAREER_CHAT_PROMPT.replace("{context}", contextStr).replace(
    "{message}",
    message
  );
  return callGemini(prompt);
}

export interface CareerReadinessResult {
  overall_score: number;
  categories: Record<
    string,
    {
      score: number;
      breakdown: Record<string, number>;
      feedback: string;
    }
  >;
  improvement_areas: {
    area: string;
    priority: string;
    action_items: string[];
  }[];
  strengths: string[];
  summary: string;
}

export async function calculateCareerReadiness(
  profile: {
    name: string;
    education: string;
    skills: string[];
    experience: string;
    projects: string;
    certifications: string;
  }
): Promise<CareerReadinessResult> {
  const prompt = CAREER_READINESS_PROMPT.replace("{name}", profile.name)
    .replace("{education}", profile.education)
    .replace("{skills}", profile.skills.join(", "))
    .replace("{experience}", profile.experience)
    .replace("{projects}", profile.projects)
    .replace("{certifications}", profile.certifications);
  const raw = await callGemini(prompt);
  return extractJSON(raw);
}
