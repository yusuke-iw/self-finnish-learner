---
name: code-review
description: >-
  Use this skill when the user asks to review code, analyze changes, perform a code review on specific files, or inspect git diffs.
---

# Code Review Skill

This skill provides step-by-step procedures for reviewing code changes (git diffs) or specific files against security, style, and performance standards.

---

## 1. Trigger Conditions

Activate this skill when the user asks to:
- "Review my code" or "Do a code review"
- "Look at this file and tell me what you think"
- "Review my latest changes / git diff"
- "Inspect my pull request changes"

---

## 2. Review Execution Steps

### Step 2.1: Gather Code Changes
Determine what code needs to be reviewed:
- **If reviewing recent local changes**:
  Run `git diff` using a terminal command to see changes. For staged changes, run `git diff --staged`.
- **If reviewing specific files**:
  Read the contents of the target files using the `view_file` tool.

### Step 2.2: Perform Analysis
Evaluate the code against the guidelines defined in [code_review_rules.md](../../rules/code_review_rules.md):
1. **Security**: Check for exposed keys, missing validation, authorization bypasses, and XSS/NoSQLi vulnerabilities.
2. **MERN Architecture**: Check route-controller-model separation, database queries (`.select('-password')`), and centralized error-handling.
3. **Performance**: Look out for missing DB indexes or inefficient React render cycles (e.g., lack of `useMemo` or missing list keys).
4. **Code Quality**: Check naming conventions, magic values, readability, and duplication.

### Step 2.3: Formulate and Format Feedback
Structure the review comments as defined in the response format of the rules:
- **Summary**: Give a brief high-level overview of the health of the changes.
- **Categorized Comments**: Group by level:
  - 🚨 **Critical**: Crucial fixes (security holes, major logic bugs, crashes).
  - ⚠️ **Warning**: Performance issues, guidelines violations, structural bugs.
  - 💡 **Suggestion**: Stylistic tweaks, refactoring opportunities, optional improvements.
- **Code Snippets/Diffs**: For every item, provide a concrete code snippet showing the current code vs. the proposed change.
