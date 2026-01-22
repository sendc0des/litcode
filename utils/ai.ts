import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. STRICT COMPLEXITY (Unchanged, as requested)
export const analyzeCodeComplexity = async (apiKey: string, code: string) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analyze the complexity of this code. 
      **STRICT OUTPUT FORMAT:**
      
      **Time Complexity:** O(...)
      **Space Complexity:** O(...)
      
      **Explanation:**
      (Short, simple explanation of WHY. Mention loops or structures used.)

      **CODE TO ANALYZE:**
      ${code}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    return "Error analyzing complexity: " + error.message;
  }
};

// 2. FOLLOW-UP CHALLENGER (Optimize -> Twist -> New Problem)
export const getFollowUpChallenge = async (apiKey: string, problem: any) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a Senior Technical Interviewer. 
      The user has written code for: "${problem.title}".
      
      **YOUR GOAL:** Provide a single, short "Follow-Up" question based on this strict priority list:
      
      **PRIORITY 1 (Optimization):** Analyze their code complexity. If it is NOT the optimal Big-O for this specific problem, ask them to optimize it. 
      (Example: "Your solution is O(N^2). Can you solve this in O(N)?")
      
      **PRIORITY 2 (Constraint Twist):**
      If the code IS optimal, propose a modification to the problem constraints.
      (Example: "Good. Now, what if the input array was sorted?" or "What if you were not allowed to use extra space?")
      
      **PRIORITY 3 (Next Challenge):**
      If the code is perfect and no interesting twists exist, suggest a related LeetCode problem.
      (Example: "Great job. You should try '3Sum' next.")

      **CONSTRAINT:** Keep your response to 1-2 sentences maximum.

      **USER'S CODE:**
      ${problem.code}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    return "Error generating challenge: " + error.message;
  }
};

// 3. SOCRATIC MENTOR (Concise & Conceptual)
export const chatWithSocraticTutor = async (apiKey: string, problem: any, chatHistory: any[], userMessage: string) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are a wise Socratic Mentor. You discuss **Computer Science Ideologies**, not code.
      
      **YOUR RULES:**
      1. **Be Concise:** Your replies must be SHORT (1-2 sentences maximum).
      2. **Be Conceptual:** Do NOT use specific coding terms like "for loop", "if statement", "dictionary", or "int". Instead use terms like "iteration", "conditional logic", "key-value pairing", or "numerical value".
      3. **Wait for the User:** Do not explain the whole solution. Give one conceptual nudge and wait.
      4. **Elaborate Only When Asked:** If the user says "explain" or "I don't get it", ONLY THEN can you be slightly more specific, but still avoid writing code.
      
      **CONTEXT:**
      - Problem: ${problem.title}
      - User Code: ${problem.code}
    `;

    const history = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will be concise and conceptual." }] },
        ...history
      ]
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();

  } catch (error: any) {
    return "Error: " + error.message;
  }
};