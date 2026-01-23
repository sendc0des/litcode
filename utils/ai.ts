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

// 3. SOCRATIC MENTOR (Strictly Conceptual, Even for Advice)
export const chatWithSocraticTutor = async (apiKey: string, problem: any, chatHistory: any[], userMessage: string) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are a specialized Socratic Mentor for the coding problem "${problem.title}".

      **YOUR RESPONSE RULES:**
      1. **Verdict First:** If the user asks about correctness, start immediately with **"Yes"**, **"No"**, or **"Almost"**.

      2. **The "Logic" Summary:** Follow the verdict with ONE or TWO sentences summarizing the *strategy*.
         - **Strict Prohibition:** Do NOT use coding terms like "HashMap", "Vector", "For Loop", "If Statement", "Index", "Array", or specific language syntax.
         - **Use Logical Terms:** Instead, use terms like "tracking values", "iterating", "checking conditions", "storing pairs", "filtering", "lookup table", or "sequence".
         - *Example:* "Yes. You are correctly iterating through the sequence and storing seen values for instant retrieval."

      3. **Handling Advice & Optimization:**
         - **Unsolicited:** Do NOT suggest optimizations or fixes unless the user asks.
         - **Solicited:** If the user asks ("How do I optimize?", "Is there a better way?"), you MUST provide a conceptual guide.
         - **CRITICAL CONSTRAINT:** Even when optimizing, do NOT name the data structure.
           - *Bad:* "Use a HashSet to reduce time complexity."
           - *Good:* "Consider using a storage mechanism that allows you to check for existence instantly, removing the need to search the entire list again."

      4. **Elaboration Mode:** - **Default:** Keep replies short (1-2 sentences).
         - **Trigger:** If the user asks to "explain", "elaborate", "why", or says "I don't get it", you may provide a detailed, paragraph-length explanation.
         - **Constraint:** The "No Code Syntax" rule is **absolute**. Explain the logic deeply, but never write the code or naming the specific reserved keywords.

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
        { role: "model", parts: [{ text: "Understood. I will be strictly conceptual, avoid all coding syntax, and only elaborate when asked." }] },
        ...history
      ]
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();

  } catch (error: any) {
    return "Error: " + error.message;
  }
};