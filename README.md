# Spec-Driven Pipeline

[![npm](https://img.shields.io/npm/v/spec-driven-pipeline.svg)](https://www.npmjs.com/package/spec-driven-pipeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**Framework CLI para equipos que quieren IA que *ejecute*, no solo converse.** Un único paquete npm combina **descubrimiento automático del repositorio**, **33 skills documentadas** bajo el estándar **Zero-Guesswork** y un **agente autónomo** que llama herramientas en bucle, puede alinearse a tus **specs en Markdown** y cerrar con verificación explícita.

---

## 🎯 Propuesta de valor: un agente de software, no un chat

| Qué **no** es | Qué **sí** es |
| :--- | :--- |
| Un reemplazo de chat genérico sin efectos en disco | Un **agente de software autónomo** orientado a tareas en tu workspace |
| Una única ida y vuelta a la API | Un **bucle multi-turno** que ejecuta herramientas (`read_text_file`, `list_directory`, `str_replace_edit`) hasta terminar o agotar el límite de turnos |
| Respuestas “de memoria” sobre rutas y archivos | Un flujo que **prioriza leer el contexto real** (FS, spec, diffs) antes de afirmar |
| Cierre informal de la tarea | Con `--spec`, un protocolo que pide **`VERIFICATION_PASS`** tras contrastar el trabajo con la spec |

En la práctica: escribís o mantenés specs en `.md`, **mapeás el proyecto** con `run`, y **delegás la ejecución** al comando `agent`, con opción de **verificar** que lo implementado cumple lo acordado en la spec.

---

## 🏗️ Arquitectura híbrida: nube (pago) vs local (privado)

El runtime usa **`fetch` nativo (Node 18+)** y **dos transportes** mutuamente excluyentes:

| Aspecto | ☁️ **Cloud — Anthropic** | 🖥️ **Local / compatible OpenAI** |
| :--- | :--- | :--- |
| **Cuándo** | Máxima calidad en razonamiento y tool calling estable | Privacidad, coste cero en hardware propio, air-gapped |
| **Endpoint** | API oficial Messages (`api.anthropic.com`) | Cualquier base que exponga **`/v1/chat/completions`** (Ollama, vLLM, Groq, OpenAI, gateways) |
| **Variable clave** | `ANTHROPIC_API_KEY` (obligatoria si no usás `API_BASE_URL`) | `API_BASE_URL` (p. ej. `http://127.0.0.1:11434/v1` para Ollama) |
| **Modelos típicos** | **Claude** (p. ej. `claude-3-5-sonnet-20241022`, o el default del paquete `claude-sonnet-4-20250514` vía `ANTHROPIC_MODEL`) | **Ollama:** `llama3.2`, `qwen2.5-coder`, etc.; **OpenAI:** vía `https://api.openai.com/v1` + `OPENAI_API_KEY` |
| **Autenticación extra** | — | `OPENAI_API_KEY` / `API_KEY` / `ANTHROPIC_API_KEY` como Bearer **solo si** el servidor lo exige (Ollama local suele ir sin token) |

> **Un solo flujo en tu repo:** el CLI no te obliga a bifurcar lógica de producto; solo cambiás variables de entorno y el modelo.

---

## 📦 Ecosistema de comandos

### `init` — estructura bajo `specs/`

Instala el pipeline en el proyecto (o en el home del usuario, según el asistente interactivo): plantillas, `pipeline.config.yaml`, árbol **`specs/`** y configuración alineada a **Cursor, Windsurf y entornos similares**. Es el punto de partida para que el equipo comparta el mismo marco spec-driven.

```bash
npx spec-driven-pipeline init
```

### `run` / `sync` — Auto-Discovery y `project-context.md`

Alias equivalentes: **`run`** y **`sync`**. Este comando:

- Asegura carpetas bajo la raíz de documentación del pipeline, `specs/config.yaml`, índice de skills y archivos de equipo.
- Ejecuta **Auto-Discovery** (implementado en `src/lib/projectDiscovery.js`): detecta stack (`package.json`, `go.mod`, `Cargo.toml`, etc.), respeta `.gitignore` y exclusiones de artefactos, y **regenera** `specs/project-context.md` con identidad del repo, scripts útiles, entrypoints heurísticos y un **árbol de directorios** acotado.

```bash
npx spec-driven-pipeline run
```

**Resultado:** el agente y los skills en el IDE **no arrancan ciegos**; el contexto del proyecto queda materializado en disco y se refresca en cada sync.

### `agent` — bucle autónomo + skills

Orquesta el **runtime del agente** (`src/agent/runAgent.js` → `src/agent/queryLoop.js`):

- **System prompt** con reglas de comportamiento y protocolo de verificación opcional.
- **Herramientas reales** (filesystem + edición mínima): `read_text_file`, `list_directory`, `str_replace_edit` (definidas en `src/agent/tools/`).
- **Bucle multi-turno:** si el modelo devuelve `tool_use` (Anthropic) o `tool_calls` (OpenAI-compatible), el código **ejecuta** las herramientas, inyecta `tool_result` en el historial y **vuelve a llamar a la API** hasta que el asistente responde solo texto, aparece **`VERIFICATION_PASS`**, o se alcanza **`SPEC_AGENT_MAX_TURNS`**.
- **Nudges** de continuación si la respuesta queda cortada o vacía (acotadas por `SPEC_AGENT_MAX_NUDGES`).
- **Verificación de spec** opcional con `--spec` o `SPEC_VERIFICATION_PATH`: rondas guiadas con `VERIFICATION_PASS` y remediación acotada (`SPEC_AGENT_MAX_VERIFICATION_GAPS`).

```bash
# Anthropic (ejemplo)
export ANTHROPIC_API_KEY="sk-ant-api03-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
npx spec-driven-pipeline agent "Auditoría: listá src/ y resumí la estructura"

# Con verificación explícita contra una spec
npx spec-driven-pipeline agent --spec specs/changes/mi-epica/spec.md "Implementá los criterios pendientes y cerrá con verificación"
```

Logs de turnos en stderr:

```bash
SPEC_AGENT_VERBOSE=1 npx spec-driven-pipeline agent "Tu instrucción"
```

#### 🧩 Las 33 Specialized Skills (plantillas)

En `templates/skills/` hay **33 skills** alineadas al baseline [Zero-Guesswork](templates/_shared/zero-guesswork-system.md). Cubren, entre otras áreas:

- **Arquitectura y estructura:** FSD (`fsd-architecture-planner`, `fsd-structure-validator`), impacto y reuso (`code-area-impact-detector`, `reuse-before-create`).
- **Épicas y alcance:** `epic-input-validator`, `epic-scope-analyzer`, `epic-domain-extractor`, `ai-archiver`, `ai-path-generator`.
- **Calidad y QA:** matrices de pruebas, casos límite, validación de inputs (`qa-*`, `analysis-input-validator`).
- **Implementación y riesgo:** cambios mínimos, decisiones técnicas, gaps y riesgos (`minimal-change-implementer`, `technical-*`, `risk-mitigation-planner`).
- **Repo y estilo:** escaneo de código/estructura, estilo, diffs, commits convencionales (`repo-*`, `code-style-*`, `diff-change-detector`, `conventional-commit-generator`).

El comando `agent` del **CLI** usa las **herramientas de código** anteriores; las **skills** son el **catálogo de prompts** para flujos en el IDE (p. ej. pasos del pipeline). Ambos se apoyan en la misma filosofía de evidencia.

---

## 🧠 Filosofía Zero-Guesswork y `VERIFICATION_PASS`

| Principio | En la práctica |
| :--- | :--- |
| **Cero adivinanza** | Skills y baseline piden **evidencia** (rutas leídas, contenido de `spec.md` / `tasks.md`, diffs) antes de afirmar cierre. |
| **Contexto antes que alucinar** | El agente está incentivado a **listar y leer** con herramientas en lugar de inventar árboles de archivos. |
| **Cierre con spec** | Con `--spec` / `SPEC_VERIFICATION_PATH`, el bucle puede pedir al modelo que **releva la spec** y emita un informe; el proceso termina de forma determinística cuando el texto incluye la línea con el token exacto **`VERIFICATION_PASS`** (o se agotan las rondas de remediación). |

Referencia del baseline: [`templates/_shared/zero-guesswork-system.md`](templates/_shared/zero-guesswork-system.md).

---

## 🔄 Flujo de trabajo recomendado

```mermaid
flowchart LR
  A[Escribir spec .md] --> B[run o sync]
  B --> C[project-context.md]
  C --> D[agent]
  D --> E{Alineado a spec}
  E -->|VERIFICATION_PASS| F[Hecho]
  E -->|Gaps| D
```

1. **Especificar** — Definí requisitos en Markdown bajo tu convención de `specs/` (ver `docs/spec-formato-unificado.md` y plantillas en `templates/`).
2. **Mapear** — `npx spec-driven-pipeline run` para regenerar `project-context.md` y mantener el índice de skills.
3. **Ejecutar** — `npx spec-driven-pipeline agent "..."` (y `--spec` si querés el protocolo de verificación contra un archivo concreto).

---

## 🦙 Guía rápida: configuración local con Ollama

Ideal para **privacidad** (el código no sale de tu red) y **ahorro** (sin facturación por token si el modelo corre en tu máquina).

```bash
# Servidor Ollama escuchando en OpenAI-compatible /v1
export API_BASE_URL="http://127.0.0.1:11434/v1"

# Modelos ligeros (CPU / poca VRAM) — ejemplo familia Qwen Coder
export ANTHROPIC_MODEL="qwen2.5-coder:1.5b"
# o
export ANTHROPIC_MODEL="qwen2.5-coder:3b"

npx spec-driven-pipeline agent "Listá el directorio src/ con profundidad máxima 2"
```

> **Nota:** `ANTHROPIC_MODEL` es el nombre del modelo **en el servidor** (Ollama/OpenAI/etc.), no solo Anthropic.

**Requisito:** el modelo debe soportar **tool calling** de forma razonable; si no, ver [Troubleshooting](#-troubleshooting).

---

## ⚙️ Variables de entorno (referencia)

| Variable | Obligatoria | Rol |
| :--- | :---: | :--- |
| `ANTHROPIC_API_KEY` | Sí*, sin `API_BASE_URL` | Clave de la API Anthropic (modo cloud). |
| `API_BASE_URL` | No | Si está definida, se usa el transporte **OpenAI-compatible** (`…/chat/completions`). |
| `OPENAI_API_KEY` / `API_KEY` | No | Bearer para backends que lo exijan (OpenAI, Groq, etc.). |
| `ANTHROPIC_MODEL` | No | Modelo remoto o local. Default en código: `claude-sonnet-4-20250514`. |
| `SPEC_VERIFICATION_PATH` | No | Ruta a la spec (equivalente a `--spec` en `agent`). |
| `SPEC_AGENT_MAX_TURNS` | No | Máximo de **vueltas** del bucle principal (default **32**). |
| `SPEC_AGENT_MAX_NUDGES` | No | Máximo de **nudges** de continuación (default **3**). |
| `SPEC_AGENT_MAX_VERIFICATION_GAPS` | No | Máximo de **rondas** de remediación sin `VERIFICATION_PASS` (default **6**). |
| `SPEC_AGENT_VERBOSE` | No | `1` = log de turnos en stderr. |

\*Con `API_BASE_URL` (p. ej. Ollama local), la clave deja de ser obligatoria.

---

## 🛠️ Troubleshooting

### Ollama: errores de memoria (OOM) o proceso terminado

| Síntoma | Qué probar |
| :--- | :--- |
| `signal: killed`, `out of memory`, o el modelo cae al cargar | Bajá de tamaño: `qwen2.5-coder:1.5b` en lugar de `3b`, o un modelo cuantizado más pequeño. |
| El sistema se vuelve lentísimo | Cerrá otras apps; en Linux, **no** compitas por RAM con builds grandes en paralelo. |
| `CUDA error` / VRAM | Usá modelo menor, cuantización mayor, o forzá CPU en Ollama si tu GPU es justa. |

### Tool calling degradado o herramientas ignoradas

- Confirmá que el modelo declare **soporte de tools** en Ollama (`ollama show <modelo>`).
- Si la API responde `tool_use` pero el parser no ve herramientas, revisá que el backend sea **compatible** con el esquema OpenAI (`tool_calls` en `choices[0].message`).

### El agente termina muy pronto

- Subí `SPEC_AGENT_MAX_TURNS` con prudencia.
- Activá `SPEC_AGENT_VERBOSE=1` para ver `needsFollowUp` y el estado de verificación.

### `API_BASE_URL` incorrecta

- Debe apuntar a la **raíz** tipo OpenAI (`https://host/v1` o `http://127.0.0.1:11434/v1`). El CLI añade `/chat/completions` si falta.

---

## 📚 Instalación y documentación adicional

```bash
npm install spec-driven-pipeline --save-dev
npx spec-driven-pipeline init
npx spec-driven-pipeline run
```

| Recurso | Contenido |
| :--- | :--- |
| [docs/guia-equipos.md](docs/guia-equipos.md) | Equipos, `config.yaml`, onboarding |
| [docs/spec-formato-unificado.md](docs/spec-formato-unificado.md) | Formato unificado de specs |
| [templates/spec-unified-template.md](templates/spec-unified-template.md) | Plantilla canónica |
| [templates/_shared/zero-guesswork-system.md](templates/_shared/zero-guesswork-system.md) | Baseline Zero-Guesswork |

---

## 📄 Licencia

**MIT** — ver [LICENSE](LICENSE).
