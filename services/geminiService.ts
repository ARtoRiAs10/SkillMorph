import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, Roadmap, Quiz, QuizQuestion, SkillAssessmentResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the learning roadmap." },
    totalWeeks: { type: Type.INTEGER, description: "The total number of weeks for this learning plan." },
    summary: { type: Type.STRING, description: "A brief 2-3 sentence summary of the entire learning journey." },
    weeklyPlans: {
      type: Type.ARRAY,
      description: "A detailed week-by-week breakdown of the learning plan.",
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          topic: { type: Type.STRING, description: "The main topic or theme for the week." },
          objectives: {
            type: Type.ARRAY,
            description: "A list of 2-3 specific learning objectives for the week.",
            items: { type: Type.STRING }
          },
          resources: {
            type: Type.ARRAY,
            description: "A list of curated learning resources.",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['video', 'article', 'docs', 'course', 'interactive', 'project_idea'] },
                title: { type: Type.STRING, description: "Title of the resource." },
                url: { type: Type.STRING, description: "A valid URL for the resource." }
              },
              required: ['type', 'title', 'url']
            }
          },
          project: {
            type: Type.OBJECT,
            description: "A milestone project to apply the week's learning.",
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING, description: "A brief description of the project." }
            },
            required: ['title', 'description']
          }
        },
        required: ['week', 'topic', 'objectives', 'resources', 'project']
      }
    }
  },
  required: ['title', 'totalWeeks', 'summary', 'weeklyPlans']
};

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A title for this skill assessment quiz." },
    questions: {
      type: Type.ARRAY,
      description: "A list of 5 multiple-choice questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The question text." },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers.",
            items: { type: Type.STRING }
          },
          topic: { type: Type.STRING, description: "The general skill topic this question covers (e.g., CSS, JavaScript, React Hooks)." }
        },
        required: ['question', 'options', 'topic']
      }
    }
  },
  required: ['title', 'questions']
};

const assessmentSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "The number of correctly answered questions." },
        total: { type: Type.INTEGER, description: "The total number of questions in the quiz." },
        summary: { type: Type.STRING, description: "A 2-4 sentence paragraph summarizing the user's skill level based on their answers. This should be encouraging and identify strengths and areas for growth. This summary will be used as the 'current skills' for generating their learning plan." }
    },
    required: ['score', 'total', 'summary']
};


export const generateSkillAssessment = async (targetRole: string): Promise<Quiz> => {
    const prompt = `
    Act as an expert technical interviewer for the role of "${targetRole}".
    Your task is to create a short, 5-question multiple-choice quiz to assess a candidate's foundational knowledge.
    
    Instructions:
    1. The questions should cover fundamental concepts required for a junior-level "${targetRole}".
    2. Each question must have exactly 4 options.
    3. Ensure one of the options is clearly the correct answer.
    4. Vary the topics of the questions to get a broad sense of their skills.
    5. Adhere strictly to the provided JSON schema. Do not include the correct answer in the output.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                temperature: 0.7,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Quiz;
    } catch (error) {
        console.error("Error generating skill assessment:", error);
        throw new Error("Failed to generate skill assessment quiz.");
    }
};

export const evaluateTestAndSummarizeSkills = async (targetRole: string, questions: QuizQuestion[], userAnswers: (number|null)[]): Promise<SkillAssessmentResult> => {
    const quizSubmission = questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        userAnswer: userAnswers[i] !== null ? q.options[userAnswers[i]!] : "Not answered"
    }));

    const prompt = `
    Act as an expert career coach and technical evaluator for the role of "${targetRole}".
    A user has just completed a skill assessment quiz. Your task is to evaluate their answers and provide a summary of their current skill level.

    This was the quiz submission:
    ${JSON.stringify(quizSubmission, null, 2)}

    Instructions:
    1. For each question, first determine the correct answer from the provided options.
    2. Compare the user's answer to the correct answer to calculate their score.
    3. Analyze the topics of the questions they answered correctly and incorrectly.
    4. Generate a concise (2-4 sentences), encouraging summary of their skills. This summary should highlight what they seem to know and point to areas for improvement, based on their quiz performance. This summary will be fed into another AI to generate a learning plan, so it should be descriptive (e.g., "Understands basic HTML structure and CSS selectors but needs to focus on JavaScript fundamentals like asynchronous operations and scope.").
    5. Adhere strictly to the provided JSON schema for your response.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: assessmentSchema,
                temperature: 0.3,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SkillAssessmentResult;
    } catch (error) {
        console.error("Error evaluating test:", error);
        throw new Error("Failed to evaluate test results.");
    }
};

const createPrompt = (userInput: UserInput): string => {
  return `
    Act as an expert career coach and learning architect. Your task is to generate a personalized, week-by-week learning roadmap for a user with the following profile:

    - **Current Skills (based on a pre-test):** ${userInput.currentSkills}
    - **Target Role:** ${userInput.targetRole}
    - **Weekly Time Commitment:** ${userInput.timePerWeek} hours
    - **Preferred Learning Style:** ${userInput.learningStyle}

    **Instructions:**
    1.  **Analyze the Skill Gap:** The user's current skills have been assessed. Create a plan that builds upon their assessed knowledge to reach the requirements for a "${userInput.targetRole}".
    2.  **Create a Realistic Timeline:** Based on the ${userInput.timePerWeek} hours/week commitment, create a structured learning plan. The plan should be challenging but achievable.
    3.  **Curate High-Quality Resources:** For each topic, provide links to reputable and preferably free resources (like MDN, freeCodeCamp, official documentation, high-quality YouTube tutorials, etc.). The resource types should align with the user's preferred learning style (${userInput.learningStyle}), but also include a mix for a well-rounded experience.
    4.  **Define Weekly Milestones:** Each week should have a clear topic, a few specific learning objectives, and a small, practical project to solidify the learning.
    5.  **Output:** Generate a complete roadmap that strictly adheres to the provided JSON schema. Do not output any text or explanation outside of the JSON structure.
    `;
};


export const generateLearningPath = async (userInput: UserInput): Promise<Roadmap> => {
  const prompt = createPrompt(userInput);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const roadmapData = JSON.parse(jsonText);
    
    // Basic validation to ensure we have the expected structure
    if (!roadmapData.weeklyPlans || roadmapData.weeklyPlans.length === 0) {
        throw new Error("Generated roadmap has no weekly plans.");
    }

    return roadmapData as Roadmap;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate learning path from AI service.");
  }
};