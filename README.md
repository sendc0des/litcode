# 🔥 LitCode - Socratic AI Mentor for LeetCode

**LitCode** is a professional Chrome Extension that transforms LeetCode into an active learning environment. Instead of giving you the answers, it acts as a **Socratic Mentor**, guiding you through problems with conceptual hints, complexity analysis, and interview-style follow-up questions.

Built with **React**, **TypeScript**, and **Google Gemini AI**.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-blue) ![Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-orange)

## ✨ Key Features

* **🧠 Socratic Mentorship**: The AI discusses *ideologies* and *concepts*, not code. It nudges you toward the solution without spoon-feeding the answer.
* **⚡ Complexity Analysis**: Instantly analyzes your current solution and provides a strict Big-O (Time & Space) assessment.
* **🎯 Interview Follow-Ups**: Acts like a senior interviewer. If your code is optimal, it challenges you with constraint twists (e.g., "What if the input was sorted?").
* **🎨 Professional UI**: A sleek, resizable dark-mode interface designed to blend seamlessly with the LeetCode editor.
* **⌨️ Developer Friendly**: Full Markdown support, syntax highlighting, and keyboard shortcuts (`Alt+L` to toggle).

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/litcode.git](https://github.com/yourusername/litcode.git)
    cd litcode
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run in Development Mode**
    ```bash
    npm run dev
    ```
    * This will open a specialized Chrome instance with the extension pre-loaded.

4.  **Build for Production (Chrome Web Store)**
    ```bash
    npm run zip
    ```
    * This generates a `.zip` file in the `.wxt/` or `dist/` folder, ready for upload to the Chrome Web Store.

## 🛠️ Tech Stack

* **Frontend**: React, TypeScript, TailwindCSS
* **Build Tool**: WXT (Web Extension Framework)
* **AI Engine**: Google Gemini 2.5 Flash API
* **Editor Integration**: DOM Scraping (LeetCode Context Awareness)

## 🎮 Usage

1.  Open any problem on [LeetCode.com](https://leetcode.com).
2.  Press `Alt + L` or click the floating **Flame Icon** to open the assistant.
3.  **Enter your API Key** (stored locally for security).
4.  Use the tools:
    * **Chat**: Ask "How do I start?" for a conceptual nudge.
    * **Follow Up**: Click this after solving to get an optimization challenge.
    * **Analyze Complexity**: Get a breakdown of your Time/Space complexity.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ by [Your Name]*