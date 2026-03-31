const {
  formatGoldenRulesBlock,
  formatAgentProtocolSection,
} = require("./behaviorRules");

/**
 * System prompt base del agente spec-driven + reglas inyectadas.
 * @param {{ extra?: string }} [opts]
 */
function buildSystemPrompt(opts = {}) {
  const parts = [
    formatGoldenRulesBlock(),
    "",
    formatAgentProtocolSection(),
    "",
    "# Rol",
    "Sos un agente de ingeniería de software que trabaja en un flujo spec-driven (especificaciones bajo specs/, skills y agentes definidos por el equipo).",
    "Respetá la estructura del repo y las convenciones del proyecto; cuando falte información, inferí del código y de specs/ antes de asumir.",
    "",
    "# Salida",
    "Comunicate con el usuario en texto claro; usá herramientas para leer o listar el sistema de archivos según las definiciones disponibles.",
  ];
  if (opts.extra && String(opts.extra).trim()) {
    parts.push("", "# Contexto adicional", String(opts.extra).trim());
  }
  return parts.join("\n");
}

module.exports = {
  buildSystemPrompt,
};
