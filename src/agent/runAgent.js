const { buildSystemPrompt } = require("./systemPrompt");
const { getAnthropicTools } = require("./tools/definitions");
const { runAgentLoop } = require("./queryLoop");

function extractTextFromMessage(msg) {
  const c = msg.content;
  if (!Array.isArray(c)) return "";
  return c
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text)
    .join("\n");
}

/**
 * @param {{
 *   userPrompt: string,
 *   cwd?: string,
 *   model?: string,
 *   extraSystem?: string,
 *   verbose?: boolean,
 *   specPath?: string | null,
 * }} opts
 */
async function runAgent(opts) {
  const apiBaseUrl = process.env.API_BASE_URL?.trim();
  const apiKey = apiBaseUrl
    ? process.env.OPENAI_API_KEY ||
      process.env.API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      ""
    : process.env.ANTHROPIC_API_KEY;
  if (!apiBaseUrl && !apiKey) {
    throw new Error(
      "Definí ANTHROPIC_API_KEY en el entorno para usar el agente (o API_BASE_URL para un backend OpenAI/Ollama y opcionalmente OPENAI_API_KEY).",
    );
  }

  const cwd = opts.cwd ?? process.cwd();
  const model =
    opts.model ||
    process.env.ANTHROPIC_MODEL ||
    "claude-sonnet-4-20250514";

  const system = buildSystemPrompt({ extra: opts.extraSystem });
  const tools = getAnthropicTools();

  const messages = [
    {
      role: "user",
      content: [{ type: "text", text: opts.userPrompt }],
    },
  ];

  const specPath =
    opts.specPath !== undefined && opts.specPath !== null
      ? opts.specPath
      : process.env.SPEC_VERIFICATION_PATH || null;

  const result = await runAgentLoop({
    apiKey,
    model,
    system,
    tools,
    messages,
    cwd,
    specPath,
    maxTurns: Number(process.env.SPEC_AGENT_MAX_TURNS || 32),
    onTurn: opts.verbose
      ? (info) => {
          console.error(
            `[agent] turno ${info.turn} stop_reason=${info.stopReason} needsFollowUp=${info.needsFollowUp} nudge=${info.nudgeCount} ver=${info.verificationState} gap=${info.gapRound}`,
          );
        }
      : undefined,
  });

  const lastAssistant = [...result.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const text = lastAssistant ? extractTextFromMessage(lastAssistant) : "";

  return {
    text,
    raw: result,
    model,
  };
}

module.exports = {
  runAgent,
  extractTextFromMessage,
};
