# Copilot Instructions

When generating code, don't use comments, the code should be self-explanatory.

Always use yarn instead of npm for package installations.

Prefer concise code without unnecessary explanatory comments.

When suggesting package installations, always use 'yarn add' instead of 'npm install'.

When running cd commands, use quotes around the directory name.

When available, use the workspace MCP servers from `.vscode/mcp.json`:
- `context7` for up-to-date documentation lookup
- `playwright` for browser validation and E2E-oriented flows
- `chrome-devtools` for runtime debugging and performance analysis
