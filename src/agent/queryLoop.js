/**
 * Bucle de agente: la decisión de seguir con herramientas sigue la presencia de
 * tool_use en el contenido. Además: nudges de continuación, verificación de spec.
 */

const path = require("path");
const { maybePersistLargeToolResult } = require("./toolResultStorage");
const { registry } = require("./tools/definitions");
const {
  CONTINUATION_NUDGE_MESSAGE,
  VERIFICATION_PASS_TOKEN,
  buildSpecVerificationUserContent,
  buildGapRemediationUserContent,
} = require("./behaviorRules");

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

const DEFAULT_MAX_NUDGE_ATTEMPTS = 3;
const DEFAULT_MAX_VERIFICATION_GAP_ROUNDS = 6;

/**
 * @param {string} baseUrl
 * @returns {string}
 */
function resolveChatCompletionsUrl(baseUrl) {
  const trimmed = String(baseUrl).trim().replace(/\/$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  return `${trimmed}/chat/completions`;
}

/**
 * @param {object[]} anthropicTools
 * @returns {object[]}
 */
function anthropicToolsToOpenAI(anthropicTools) {
  if (!Array.isArray(anthropicTools)) return [];
  return anthropicTools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema || { type: "object", properties: {} },
    },
  }));
}

/**
 * Expande un mensaje user de Anthropic (bloques text/tool_result) al formato OpenAI.
 * @param {object} userMsg
 * @returns {object[]}
 */
function anthropicUserMessageToOpenAIMessages(userMsg) {
  const content = userMsg.content;
  if (!Array.isArray(content)) {
    return [{ role: "user", content: String(content ?? "") }];
  }
  const textParts = [];
  const toolResults = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "text" && typeof block.text === "string") {
      textParts.push(block.text);
    }
    if (block.type === "tool_result") toolResults.push(block);
  }
  /** @type {object[]} */
  const out = [];
  if (textParts.length) {
    out.push({ role: "user", content: textParts.join("\n") });
  }
  for (const tr of toolResults) {
    const raw = tr.content;
    const cstr = typeof raw === "string" ? raw : JSON.stringify(raw ?? "");
    out.push({
      role: "tool",
      tool_call_id: tr.tool_use_id,
      content: cstr,
    });
  }
  if (out.length === 0) {
    out.push({ role: "user", content: "" });
  }
  return out;
}

/**
 * @param {object} assistantMsg
 * @returns {object}
 */
function anthropicAssistantMessageToOpenAI(assistantMsg) {
  const content = assistantMsg.content;
  if (!Array.isArray(content)) {
    return {
      role: "assistant",
      content: typeof content === "string" ? content : "",
    };
  }
  const textParts = [];
  const toolUses = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "text" && typeof block.text === "string") {
      textParts.push(block.text);
    }
    if (block.type === "tool_use") toolUses.push(block);
  }
  if (toolUses.length === 0) {
    return { role: "assistant", content: textParts.join("\n") };
  }
  const tool_calls = toolUses.map((b) => ({
    id: b.id,
    type: "function",
    function: {
      name: b.name,
      arguments: JSON.stringify(
        b.input && typeof b.input === "object" ? b.input : {},
      ),
    },
  }));
  return {
    role: "assistant",
    content: textParts.length ? textParts.join("\n") : null,
    tool_calls,
  };
}

/**
 * @param {object[]} messages - formato Anthropic (role + content con bloques)
 * @param {string} system
 * @returns {object[]}
 */
function anthropicMessagesToOpenAIChat(messages, system) {
  /** @type {object[]} */
  const out = [];
  if (system && String(system).trim()) {
    out.push({ role: "system", content: String(system) });
  }
  for (const msg of messages) {
    if (msg.role === "user") {
      out.push(...anthropicUserMessageToOpenAIMessages(msg));
    } else if (msg.role === "assistant") {
      out.push(anthropicAssistantMessageToOpenAI(msg));
    }
  }
  return out;
}

/**
 * Normaliza la respuesta de /v1/chat/completions al shape que espera el bucle (Anthropic-like).
 * @param {object} data
 * @returns {{ content: object[], stop_reason: string }}
 */
function openAIChatChoiceToAnthropicShape(data) {
  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error("Respuesta OpenAI-compat: sin choices[0]");
  }
  const msg = choice.message;
  if (!msg) {
    throw new Error("Respuesta OpenAI-compat: sin message");
  }
  const finish = choice.finish_reason ?? null;

  /** @type {object[]} */
  const content = [];
  if (msg.content != null) {
    if (typeof msg.content === "string") {
      if (msg.content.trim()) {
        content.push({ type: "text", text: msg.content });
      }
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part?.type === "text" && part.text) {
          content.push({ type: "text", text: part.text });
        }
      }
    }
  }
  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      let input = {};
      try {
        const arg = tc.function?.arguments ?? "{}";
        input = typeof arg === "string" ? JSON.parse(arg || "{}") : arg;
      } catch {
        input = {};
      }
      content.push({
        type: "tool_use",
        id: tc.id,
        name: tc.function?.name ?? "unknown",
        input,
      });
    }
  }

  let stop_reason = "end_turn";
  if (finish === "length") stop_reason = "max_tokens";
  else if (
    finish === "tool_calls" ||
    content.some((b) => b.type === "tool_use")
  ) {
    stop_reason = "tool_use";
  }

  return { content, stop_reason };
}

/**
 * @param {{
 *   baseUrl: string,
 *   apiKey: string,
 *   model: string,
 *   system: string,
 *   tools: object[],
 *   messages: object[],
 *   maxTokens: number,
 * }} p
 */
async function callOpenAICompatibleChat(p) {
  const url = resolveChatCompletionsUrl(p.baseUrl);
  /** @type {Record<string, string>} */
  const headers = {
    "content-type": "application/json",
  };
  if (p.apiKey) {
    headers.authorization = `Bearer ${p.apiKey}`;
  }
  const openaiMessages = anthropicMessagesToOpenAIChat(p.messages, p.system);
  /** @type {Record<string, unknown>} */
  const body = {
    model: p.model,
    messages: openaiMessages,
    max_tokens: p.maxTokens,
  };
  if (p.tools && p.tools.length) {
    body.tools = anthropicToolsToOpenAI(p.tools);
    body.tool_choice = "auto";
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      `HTTP ${res.status}: ${JSON.stringify(data)}`;
    throw new Error(msg);
  }
  return openAIChatChoiceToAnthropicShape(data);
}

/**
 * @param {unknown} content
 * @returns {boolean}
 */
function needsFollowUpFromAssistantContent(content) {
  if (!Array.isArray(content)) return false;
  return content.some((block) => block && block.type === "tool_use");
}

/**
 * @param {unknown} content
 * @returns {string}
 */
function extractAssistantText(content) {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

/**
 * @param {string} token
 */
function escapeRegex(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Heurística de tarea incompleta (sin depender solo de stop_reason).
 * @param {string} text
 * @param {string | null} stopReason
 */
function shouldNudgeContinuation(text, stopReason, nudgeCount, maxNudgeAttempts) {
  if (nudgeCount >= maxNudgeAttempts) return false;
  const t = (text || "").trim();
  if (stopReason === "max_tokens") return true;
  if (t.length === 0) return true;
  if (/\b(TODO|FIXME|PENDIENTE|INCOMPLETO)\b/i.test(t)) return true;
  if (/\[ *\.{3} *\]|\.\.\.\s*$/i.test(t)) return true;
  if (/\(continuará|to be continued|truncat/i.test(t)) return true;
  return false;
}

/**
 * @param {object} assistantMessage
 * @param {{ cwd: string }} cfg
 */
async function executeToolUses(assistantMessage, cfg) {
  const content = assistantMessage.content;
  if (!Array.isArray(content)) return [];

  const toolBlocks = content.filter((b) => b.type === "tool_use");
  const results = [];

  for (const block of toolBlocks) {
    const id = block.id;
    const name = block.name;
    const input = block.input && typeof block.input === "object" ? block.input : {};
    const def = registry[name];
    let text;
    let isError = false;
    try {
      if (!def) {
        throw new Error(`Herramienta desconocida: ${name}`);
      }
      const out = await def.run(input, { cwd: cfg.cwd });
      text = await maybePersistLargeToolResult(
        typeof out === "string" ? out : String(out),
        { cwd: cfg.cwd },
      );
    } catch (err) {
      isError = true;
      text =
        err instanceof Error ? err.message : `Error: ${String(err)}`;
    }

    results.push({
      type: "tool_result",
      tool_use_id: id,
      content: text,
      ...(isError ? { is_error: true } : {}),
    });
  }

  return results;
}

/**
 * @param {object} body
 * @param {string} apiKey
 */
async function callAnthropicMessages(body, apiKey) {
  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      `HTTP ${res.status}: ${JSON.stringify(data)}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * @param {{
 *   apiKey: string,
 *   model: string,
 *   system: string,
 *   tools: object[],
 *   messages: object[],
 *   maxTokens?: number,
 *   cwd?: string,
 *   maxTurns?: number,
 *   specPath?: string | null,
 *   maxNudgeAttempts?: number,
 *   maxVerificationGapRounds?: number,
 *   onTurn?: (info: object) => void,
 * }} params
 */
async function runAgentLoop(params) {
  const {
    apiKey,
    model,
    system,
    tools,
    messages: initialMessages,
    maxTokens = 4096,
    cwd = process.cwd(),
    maxTurns = 32,
    specPath: specPathRaw = null,
    maxNudgeAttempts = Number(
      process.env.SPEC_AGENT_MAX_NUDGES || DEFAULT_MAX_NUDGE_ATTEMPTS,
    ),
    maxVerificationGapRounds = Number(
      process.env.SPEC_AGENT_MAX_VERIFICATION_GAPS ||
        DEFAULT_MAX_VERIFICATION_GAP_ROUNDS,
    ),
    onTurn,
  } = params;

  const specPath =
    specPathRaw && String(specPathRaw).trim()
      ? path.isAbsolute(specPathRaw)
        ? specPathRaw
        : path.resolve(cwd, specPathRaw)
      : null;

  const messages = [...initialMessages];
  let turn = 0;
  let nudgeCount = 0;
  /** @type {'none' | 'awaiting_pass' | 'passed'} */
  let verificationState = "none";
  let gapRound = 0;

  const apiBaseUrl = process.env.API_BASE_URL?.trim() || null;

  while (turn < maxTurns) {
    turn += 1;

    /** @type {{ content: object[], stop_reason: string }} */
    let response;
    if (apiBaseUrl) {
      response = await callOpenAICompatibleChat({
        baseUrl: apiBaseUrl,
        apiKey,
        model,
        system,
        tools,
        messages,
        maxTokens,
      });
    } else {
      const body = {
        model,
        max_tokens: maxTokens,
        system,
        messages,
        tools,
      };
      const data = await callAnthropicMessages(body, apiKey);
      response = {
        content: data.content,
        stop_reason: data.stop_reason ?? "end_turn",
      };
    }

    const stopReason = response.stop_reason ?? null;

    const assistantMsg = {
      role: "assistant",
      content: response.content,
    };
    messages.push(assistantMsg);

    const assistantContent = response.content;
    const needsFollowUp = needsFollowUpFromAssistantContent(assistantContent);
    const textOnly = extractAssistantText(assistantContent);

    if (typeof onTurn === "function") {
      onTurn({
        turn,
        stopReason,
        needsFollowUp,
        nudgeCount,
        verificationState,
        gapRound,
      });
    }

    if (needsFollowUp) {
      const toolResultContent = await executeToolUses(
        { content: assistantContent },
        { cwd },
      );

      if (toolResultContent.length === 0) {
        return {
          messages,
          lastResponse: response,
          stopReason,
          turns: turn,
          nudgeCount,
          verificationState,
          gapRound,
          warning:
            "needsFollowUp era true pero no se generaron tool_results; abortando para evitar bucle.",
        };
      }

      messages.push({
        role: "user",
        content: toolResultContent,
      });
      continue;
    }

    // --- Solo texto (sin tool_use en esta respuesta) ---

    if (
      shouldNudgeContinuation(
        textOnly,
        stopReason,
        nudgeCount,
        maxNudgeAttempts,
      )
    ) {
      nudgeCount += 1;
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: CONTINUATION_NUDGE_MESSAGE,
          },
        ],
      });
      continue;
    }

    if (specPath && verificationState === "none") {
      verificationState = "awaiting_pass";
      gapRound = 0;
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: buildSpecVerificationUserContent(specPath),
          },
        ],
      });
      continue;
    }

    if (specPath && verificationState === "awaiting_pass") {
      const passRe = new RegExp(
        `\\b${escapeRegex(VERIFICATION_PASS_TOKEN)}\\b`,
      );
      if (passRe.test(textOnly)) {
        verificationState = "passed";
        return {
          messages,
          lastResponse: response,
          stopReason,
          turns: turn,
          nudgeCount,
          verificationState,
          gapRound,
          completed: true,
          verificationOutcome: "pass",
        };
      }

      if (gapRound >= maxVerificationGapRounds) {
        return {
          messages,
          lastResponse: response,
          stopReason,
          turns: turn,
          nudgeCount,
          verificationState,
          gapRound,
          completed: false,
          verificationOutcome: "gap_limit",
          warning: `Límite de rondas de remediación de verificación (${maxVerificationGapRounds}).`,
        };
      }

      gapRound += 1;
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: buildGapRemediationUserContent(),
          },
        ],
      });
      continue;
    }

    return {
      messages,
      lastResponse: response,
      stopReason,
      turns: turn,
      nudgeCount,
      verificationState,
      gapRound,
      completed: true,
      /** Sin specPath no hay paso de verificación forzado. */
      verificationOutcome: "not_requested",
    };
  }

  return {
    messages,
    lastResponse: null,
    stopReason: "max_turns",
    turns: turn,
    nudgeCount,
    verificationState,
    gapRound,
    completed: false,
    warning: `Límite de vueltas alcanzado (${maxTurns}).`,
  };
}

module.exports = {
  runAgentLoop,
  needsFollowUpFromAssistantContent,
  extractAssistantText,
  shouldNudgeContinuation,
  executeToolUses,
  callAnthropicMessages,
};
