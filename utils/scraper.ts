export const getProblemData = () => {
  // 1. Scrape the Description (using multiple selectors for reliability)
  const titleSelector = 'div[data-cy="question-title"], .text-title-large, .mr-2.text-xl';
  const descSelector = 'div[data-cy="question-content"], .elfjS, div[class*="description"]';
  
  const title = document.querySelector(titleSelector)?.textContent || "Unknown Problem";
  const description = document.querySelector(descSelector)?.textContent || "Could not find description.";

  // 2. Scrape the Code from Monaco Editor
  // We look for the visible lines in the editor
  const codeLines = document.querySelectorAll('.view-lines div.view-line');
  let code = "";
  codeLines.forEach((line) => {
    code += line.textContent + "\n";
  });

  return {
    title,
    description: description.replace(/\n+/g, ' ').slice(0, 3000), // Clean up whitespace
    code: code || "// No code found. Please ensure code is visible in the editor."
  };
};