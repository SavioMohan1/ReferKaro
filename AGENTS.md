# AGENTS.md - System Rules for your Project

## 1. Zero-Assumption Protocol (Anti-Hallucination)
* **Verification over Assertion:** You are prohibited from stating a task is "complete" unless you have run a `cat`, `ls`, or `grep` command to verify the file content on disk.
* **The "I Don't Know" Mandate:** If a library version or API endpoint is not in the current workspace context, you must use the **Browser Tool** to verify the latest documentation before writing a single line of code. Do not guess syntax.
* **State Transparency:** If a command fails or a file is missing, do not "simulate" a fix. Report the error immediately and request clarification.

## 2. Agentic Workflow (The "Antigravity" Method)
* **Planning Phase:** Before any execution, generate a `PLAN.md` artifact. This plan must include:
    1.  Files to be created/modified.
    2.  Dependencies to be installed.
    3.  A "Test Plan" (how you will prove the code works).
* **Atomic Changes:** Do not attempt to build the entire app in one turn. Execute one sub-task, verify it via the terminal or browser, and only then proceed to the next.

## 3. Design & Markdown Standards
* **Clean Architecture:** Use a layered directory structure (e.g., `/src/components`, `/src/hooks`, `/src/services`).
* **Documented Diffs:** Every code change must be accompanied by a brief explanation of *why* the change was made, formatted in clean Markdown.
* **Visual Assets:** Use the integrated **Nano Banana** tool for any UI placeholders or image assets rather than using external URLs that may break.

## 4. Execution Guardrails
* **Self-Correction:** After running a build command (e.g., `npm run build`), you must read the terminal output. If warnings exist, you must address them before declaring the task finished.
* **No Ghost Files:** Never reference a file that does not exist in the current file tree.

## 5. Ask user for model
* **Prompt which Model to use:** Everytime your give your response give a suggestion to the user to use which ai model based on the usecase you are going to do.
