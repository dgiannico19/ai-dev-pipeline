# Spec-Driven Pipeline

[![npm](https://img.shields.io/npm/v/spec-driven-pipeline.svg)](https://www.npmjs.com/package/spec-driven-pipeline)

**Framework CLI para equipos que quieren IA que *ejecute*, no solo converse.** Un único paquete npm combina **descubrimiento automático del repositorio**, **33 skills documentadas** bajo el estándar **Zero-Guesswork** y un **agente autónomo** que llama herramientas en bucle, puede alinearse a tus **specs en Markdown** y cerrar con verificación explícita.

## Propuesta de valor: un agente de software, no un chat

**Qué no es**

- Un reemplazo de chat genérico sin efectos en disco.
- Una única ida y vuelta a la API.
- Respuestas de memoria sobre rutas y archivos sin leer el disco.
- Un cierre informal de la tarea sin contraste con la spec.

**Qué sí es**

- Un **agente de software autónomo** orientado a tareas en tu workspace.
- Un **bucle multi-turno** con herramientas (`read_text_file`, `list_directory`, `str_replace_edit`) hasta terminar o agotar el límite de turnos.
- Un flujo que **prioriza leer el contexto real** (FS, spec, diffs) antes de afirmar.
- Con `--spec`, un protocolo que pide **`VERIFICATION_PASS`** tras contrastar el trabajo con la spec.

En la práctica: escribís o mantenés specs en `.md`, **mapeás el proyecto** con `run`, y **delegás la ejecución** al comando `agent`.

## Arquitectura: nube (Anthropic) vs local (OpenAI-compatible)

El runtime usa **`fetch` nativo (Node 18+)** y un solo mecanismo de transporte según entorno.

### Cloud (Anthropic)

- Uso: máxima calidad en razonamiento y tool calling estable.
- Endpoint: API oficial Messages (`api.anthropic.com`).
- Variable: `ANTHROPIC_API_KEY` (obligatoria si no usás `API_BASE_URL`).
- Modelos: **Claude** (por ejemplo `claude-3-5-sonnet-20241022`; default del paquete `claude-sonnet-4-20250514` vía `ANTHROPIC_MODEL`).

### Local / OpenAI-compatible (Ollama, vLLM, Groq, OpenAI, gateways)

- Uso: privacidad, coste cero en hardware propio, entornos air-gapped.
- Endpoint: base que exponga **`/v1/chat/completions`** (ejemplo Ollama: `http://127.0.0.1:11434/v1`).
- Variable: `API_BASE_URL`.
- Modelos: `llama3.2`, `qwen2.5-coder`, etc.; OpenAI vía `https://api.openai.com/v1` y `OPENAI_API_KEY`.
- Bearer opcional: `OPENAI_API_KEY`, `API_KEY` o `ANTHROPIC_API_KEY` si el servidor lo exige (Ollama local suele ir sin token).

**Un solo flujo en tu repo:** solo cambiás variables de entorno y el modelo.

## Comandos

### init

Instala el pipeline: plantillas, `pipeline.config.yaml`, árbol **`specs/`** y configuración para Cursor, Windsurf y similares.

```bash
npx spec-driven-pipeline init
```

### run / sync

Alias: **`run`** y **`sync`**. Asegura carpetas, `specs/config.yaml`, índice de skills y ejecuta **Auto-Discovery** (`src/lib/projectDiscovery.js`): stack del repo, `.gitignore`, y **`specs/project-context.md`** con entrypoints y árbol acotado.

```bash
npx spec-driven-pipeline run
```

### agent

Runtime en `src/agent/runAgent.js` y `src/agent/queryLoop.js`: herramientas reales, bucle multi-turno, nudges opcionales, verificación con `--spec` o `SPEC_VERIFICATION_PATH` y token **`VERIFICATION_PASS`**.

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
npx spec-driven-pipeline agent "Auditoría: listá src/ y resumí la estructura"

npx spec-driven-pipeline agent --spec specs/changes/mi-epica/spec.md "Implementá los criterios pendientes y cerrá con verificación"
```

Logs de turnos en stderr:

```bash
SPEC_AGENT_VERBOSE=1 npx spec-driven-pipeline agent "Tu instrucción"
```

**Skills (33 plantillas)** en `templates/skills/`, alineadas a [Zero-Guesswork](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/templates/_shared/zero-guesswork-system.md): arquitectura FSD, épicas, QA, riesgo, repo, estilo, diffs, commits, etc. El CLI usa **herramientas de código**; las skills son el catálogo para flujos en el IDE.

## Zero-Guesswork y VERIFICATION_PASS

- **Cero adivinanza:** evidencia (rutas leídas, `spec.md` / `tasks.md`, diffs) antes de cerrar.
- **Contexto antes que alucinar:** listar y leer con herramientas.
- **Cierre con spec:** con `--spec`, el bucle puede pedir releer la spec; el proceso termina cuando el texto incluye **`VERIFICATION_PASS`** o se agotan las rondas de remediación.

Baseline: [zero-guesswork-system.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/templates/_shared/zero-guesswork-system.md)

## Flujo de trabajo

1. Escribir o actualizar la spec (`.md` bajo tu convención en `specs/`).
2. `npx spec-driven-pipeline run` para `specs/project-context.md` y el índice de skills.
3. `npx spec-driven-pipeline agent "..."` (opcional `--spec` para verificación).

## Ollama (local)

```bash
export API_BASE_URL="http://127.0.0.1:11434/v1"
export ANTHROPIC_MODEL="qwen2.5-coder:1.5b"
# o: qwen2.5-coder:3b

npx spec-driven-pipeline agent "Listá el directorio src/ con profundidad máxima 2"
```

`ANTHROPIC_MODEL` es el nombre del modelo **en el servidor** (no solo Anthropic). El modelo debe soportar **tool calling**. Más ayuda en la sección **Troubleshooting** abajo.

## Variables de entorno

- **`ANTHROPIC_API_KEY`**: obligatoria sin `API_BASE_URL` (modo Anthropic).
- **`API_BASE_URL`**: activa transporte OpenAI-compatible (`…/chat/completions`).
- **`OPENAI_API_KEY` / `API_KEY`**: Bearer si el backend lo pide.
- **`ANTHROPIC_MODEL`**: modelo remoto o local (default en código: `claude-sonnet-4-20250514`).
- **`SPEC_VERIFICATION_PATH`**: ruta a la spec (equivalente a `--spec`).
- **`SPEC_AGENT_MAX_TURNS`**: tope de vueltas (default **32**).
- **`SPEC_AGENT_MAX_NUDGES`**: nudges de continuación (default **3**).
- **`SPEC_AGENT_MAX_VERIFICATION_GAPS`**: rondas de remediación (default **6**).
- **`SPEC_AGENT_VERBOSE`**: `1` para log de turnos en stderr.

Con `API_BASE_URL` (Ollama local), la clave de Anthropic deja de ser obligatoria.

## Troubleshooting

### Ollama y memoria

- Proceso muerto u OOM: probá un modelo más chico (`qwen2.5-coder:1.5b` vs `3b`) o más cuantizado.
- Sistema lento: cerrar otras apps; no competir por RAM con builds enormes en paralelo.
- Errores CUDA / VRAM: modelo menor, más cuantización, o CPU en Ollama.

### Tool calling

- Verificá soporte con `ollama show <modelo>`.
- El backend debe devolver `tool_calls` en el mensaje del asistente (esquema OpenAI).

### El agente corta muy pronto

- Aumentá `SPEC_AGENT_MAX_TURNS` con cuidado.
- Usá `SPEC_AGENT_VERBOSE=1`.

### API_BASE_URL

- Debe ser la raíz tipo OpenAI (`https://host/v1` o `http://127.0.0.1:11434/v1`). El CLI agrega `/chat/completions` si falta.

## Instalación y docs

```bash
npm install spec-driven-pipeline --save-dev
npx spec-driven-pipeline init
npx spec-driven-pipeline run
```

- [guia-equipos.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/docs/guia-equipos.md)
- [spec-formato-unificado.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/docs/spec-formato-unificado.md)
- [spec-unified-template.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/templates/spec-unified-template.md)
- [zero-guesswork-system.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/templates/_shared/zero-guesswork-system.md)

## Licencia

**MIT** — ver [LICENSE](https://github.com/dgiannico19/spec-driven-pipeline/blob/master/LICENSE).
