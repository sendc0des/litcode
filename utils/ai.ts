import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type ModelProvider = 'gemini' | 'openai' | 'claude';

// The "Golden Rules" for our Socratic Mentor
const SOCRATIC_SYSTEM_PROMPT = (problemTitle: string, problemCode: string) => `
  You are a specialized Socratic Mentor for the coding problem "${problemTitle}".

  **YOUR RESPONSE RULES:**
  1. **Verdict First:** If the user asks about correctness, start immediately with "Yes", "No", or "Almost".
  2. **The "Logic" Summary:** Follow with 1-2 sentences summarizing the strategy. 
     - PROHIBITION: Do NOT use coding terms like "HashMap", "Vector", "For Loop", "If Statement", "Index", or "Array".
     - USE LOGICAL TERMS: Use "tracking values", "iterating", "checking conditions", "storing pairs", or "lookup table".
  3. **Advice & Optimization:** Only suggest if asked. Never name the data structure directly.
  4. **Elaboration Mode:** Only provide detailed paragraphs if the user says "explain" or "elaborate".
  
  **CONTEXT:**
  - Problem: ${problemTitle}
  - User Code: ${problemCode}
`;

const COMPLEXITY_SYSTEM_PROMPT = `
  Analyze the code provided. 
  STRICT OUTPUT FORMAT:
  **Time Complexity:** O(...)
  **Space Complexity:** O(...)
  **Explanation:** (Brief technical explanation)
`;

const FOLLOWUP_SYSTEM_PROMPT = (problemTitle: string, problemCode: string) => `
  You are a Senior Technical Interviewer. User solved: "${problemTitle}".
  PRIORITY 1: If code is not optimal, ask them to optimize (O(N^2) -> O(N)).
  PRIORITY 2: If optimal, propose a constraint twist (e.g., "What if the input was sorted?").
  PRIORITY 3: If perfect, suggest a related LeetCode problem.
  Keep it to 1-2 sentences.
  USER CODE: ${problemCode}
`;

// Helper to route requests based on provider
const generateResponse = async (
  provider: ModelProvider, 
  apiKey: string, 
  systemPrompt: string, 
  userMessage: string,
  history: any[] = []
) => {
  try {
    if (!apiKey) throw new Error("API Key is missing for " + provider);

    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use stable 2.0 Flash
      
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I will follow the Socratic Mentor rules strictly." }] },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        ]
      });
      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } 
    
    else if (provider === 'openai') {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text })),
        { role: "user", content: userMessage }
      ];
      const completion = await openai.chat.completions.create({
        messages: messages as any,
        model: "gpt-4o",
      });
      return completion.choices[0].message.content || "No response";
    }

    else if (provider === 'claude') {
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text })),
          { role: "user", content: userMessage }
        ] as any,
      });
      return (message.content[0] as any).text;
    }

    return "Invalid Provider";
  } catch (error: any) {
    return `Error (${provider}): ${error.message}`;
  }
};

// --- EXPORTED FUNCTIONS ---

export const analyzeCodeComplexity = async (apiKey: string, provider: ModelProvider, code: string) => {
  return generateResponse(provider, apiKey, COMPLEXITY_SYSTEM_PROMPT, `Analyze this code: \n${code}`);
};

export const getFollowUpChallenge = async (apiKey: string, provider: ModelProvider, problem: any) => {
  const prompt = FOLLOWUP_SYSTEM_PROMPT(problem.title, problem.code);
  return generateResponse(provider, apiKey, "You are a senior technical interviewer.", prompt);
};

export const chatWithSocraticTutor = async (apiKey: string, provider: ModelProvider, problem: any, history: any[], userMsg: string) => {
  const systemPrompt = SOCRATIC_SYSTEM_PROMPT(problem.title, problem.code);
  return generateResponse(provider, apiKey, systemPrompt, userMsg, history);
};