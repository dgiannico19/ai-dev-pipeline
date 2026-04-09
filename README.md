# spec-driven-pipeline

[![npm](https://img.shields.io/npm/v/spec-driven-pipeline.svg)](https://www.npmjs.com/package/spec-driven-pipeline)

**Transformá tus archivos .md en código real de forma autónoma, local y con verificación garantizada.**

CLI **spec-driven** para equipos: instala plantillas bajo `specs/`, **descubre el repo** y genera `specs/project-context.md`
<!-- , y expone un comando **`agent`** que usa el modelo que elijas (Anthropic en la nube o un servidor compatible con OpenAI, por ejemplo **Ollama** en tu máquina). -->

<!-- **Requisito:** Node.js **18 o superior** (usa `fetch` nativo). -->

<!-- ## Por qué usar esto (y no solo un chat genérico)

- **Privacidad total:** podés correr **100% local** con **Ollama**; el código no sale de tu red si el modelo corre en tu máquina.
- **Zero-Guesswork:** el agente **lee tu disco** con herramientas (`read_text_file`, `list_directory`, `str_replace_edit`); no inventa rutas sin evidencia.
- **Auto-verificación:** con `--spec`, el flujo puede exigir alineación con tu Markdown hasta emitir **`VERIFICATION_PASS`** (no es un único disparo y listo). -->

---

## Documentación en el repositorio

- [docs/guia-equipos.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/main/docs/guia-equipos.md)
- [docs/spec-formato-unificado.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/main/docs/spec-formato-unificado.md)
- [templates/spec-unified-template.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/main/templates/spec-unified-template.md)
- [templates/_shared/zero-guesswork-system.md](https://github.com/dgiannico19/spec-driven-pipeline/blob/main/templates/_shared/zero-guesswork-system.md)

---

## Quick Start en 3 pasos

**1.** Instalá el paquete en tu proyecto:

```bash
npm install spec-driven-pipeline --save-dev
```

**2.** Generá la estructura `specs/` y la config del pipeline:

```bash
npx spec-driven-pipeline init
```

<!-- **3.** Ejecutá el agente con una instrucción (antes definí la API del modelo; ver sección **agent** más abajo):

```bash
npx spec-driven-pipeline agent "Hola"
``` -->

**Recomendado:** después de `init`, corré `npx spec-driven-pipeline run` una vez para regenerar **`specs/project-context.md`** (contexto del repo sin costo de API).

---

## 🤖 Los 8 agentes del pipeline

Inicia cada fase invocando al agente correspondiente en el chat de tu IDE:

### 🏗️ 1. Iniciador de propuesta (Step 1)

- **Comando:** `/step-1-ai-proposal-initiator`
- **Misión:** Crear la carpeta de épica con **`spec.md`**, **`config.yaml`** de épica y **`proposal.md`**.
- **Skills:** `epic-input-validator`, `ai-path-generator`, `epic-scope-analyzer`, `epic-domain-extractor`.

### 🔍 2. Analizador de exploración (Step 2)

- **Comando:** `/step-2-ai-exploration-analyzer`
- **Misión:** Código + `specs/library/` frente a `proposal.md` / `spec.md` → **`exploration.md`** (y refinar `spec.md` si aplica).
- **Skills:** `spec-library-reader`, `repo-structure-scanner`, `technical-gap-analyzer`, `code-area-impact-detector`.

### 🧠 3. Constructor de diseño (Step 3)

- **Comando:** `/step-3-ai-design-builder`
- **Misión:** **`design.md`** y **`tasks.md`**; mantiene coherencia con **`spec.md`**.
- **Skills:** `technical-decision-maker`, `task-list-generator`, `fsd-architecture-planner`.

### 📘 4. Comportamiento y QA (Step 4)

- **Comando:** `/step-4-ai-qa-manual-generator`
- **Misión:** Completar reglas y escenarios en **`spec.md`**, generar **`testing.md`**, opcionalmente actualizar **`specs/library/`**.
- **Skills:** `qa-test-matrix-builder`, `usage-manual-builder`, `qa-edge-case-expander`, `fsd-structure-validator`.

### 🔨 5. Ejecutor de desarrollo (Step 5)

- **Comando:** `/step-5-ai-dev-executor`
- **Misión:** Implementar código según `design.md` / `spec.md` / `testing.md` y marcar **`tasks.md`**.
- **Skills:** `repo-code-analyzer`, `task-progress-updater`, `code-style-enforcer`, `minimal-change-implementer`.

### 🛡️ 6. Revisor estricto (Step 6)

- **Comando:** `/step-6-ai-strict-reviewer`
- **Misión:** Auditoría frente a `spec.md`, `design.md`, `tasks.md`, `testing.md`.
- **Skills:** `diff-change-detector`, `code-style-reviewer`, `task-completion-verifier`.

### 📦 7. Organizador de commits (Step 7)

- **Comando:** `/step-7-ai-commit-splitter`
- **Misión:** Plan de **Conventional Commits** atómicos (cruza con `tasks.md` en `specs/changes/`).
- **Skills:** `conventional-commit-generator`.

### 🗃️ 8. Archivador (Step 8)

- **Comando:** `/step-8-ai-archiver`
- **Misión:** Promover a **`specs/library/`**; archivar en **`specs/changes/archive/[épica]/`** (raíz: cuatro `.md` + **`.openspec.yaml`** desde `config.yaml`; carpeta **`specs/`** con `spec.md` y `testing.md`); luego **`rm -rf`** la carpeta activa en `specs/changes/[épica]`.
- **Skills:** `ai-archiver`.

---

<!-- ## Dónde va la spec para `agent --spec`

Cualquier archivo **`.md`** bajo la carpeta **`specs/`** (o la ruta que uses en tu equipo) puede ser la **fuente de verdad** que pasás a verificación. Apuntá a ese archivo con la ruta relativa al proyecto:

```bash
npx spec-driven-pipeline agent --spec specs/mi-epica/spec.md "Implementá lo acordado y cerrá con verificación"
``` -->

Equivalente por entorno: `SPEC_VERIFICATION_PATH` con la misma ruta que `--spec`.

## Otras formas de instalar el CLI

### Sin instalar dependencia (solo npx)

```bash
npx spec-driven-pipeline init
npx spec-driven-pipeline run
```

### Sin dejar paquete en el proyecto (ya cubierto arriba)

`npx` usa la versión publicada; para fijar versión podés usar `npx spec-driven-pipeline@2 ...`.

## Comandos del CLI

### init

Copia plantillas, `pipeline.config.yaml` y el árbol bajo **`specs/`** (flujo interactivo según el entorno). Primer paso para alinear Cursor, Windsurf u otros flujos con el pipeline.

```bash
npx spec-driven-pipeline init
```

### run o sync

**Alias:** `run` y `sync` hacen lo mismo. En el directorio actual:

- Crea carpetas necesarias bajo la raíz de documentación del pipeline.
- Mantiene `specs/config.yaml`, índice de skills y archivos de equipo.
- Ejecuta **auto-discovery** y **regenera** `specs/project-context.md` (stack, scripts, entrypoints heurísticos, árbol acotado respetando `.gitignore`).

```bash
npx spec-driven-pipeline run
```

<!-- ### agent

Llama al modelo por HTTP, usa **herramientas** en bucle, **nudges** de continuación opcionales y, con `--spec`, verificación hasta **`VERIFICATION_PASS`**.

```bash
npx spec-driven-pipeline agent "Tu instrucción en lenguaje natural"
```

```bash
npx spec-driven-pipeline agent --spec specs/mi-carpeta/spec.md "Implementá lo pedido y cerrá con verificación"
```

Depuración por turnos (stderr):

```bash
SPEC_AGENT_VERBOSE=1 npx spec-driven-pipeline agent "..."
```

**Anthropic (solo nube):** `ANTHROPIC_API_KEY`. Opcional: `ANTHROPIC_MODEL` (default en código: `claude-sonnet-4-20250514`).

**Backend compatible OpenAI** (Ollama, vLLM, Groq, OpenAI): **`API_BASE_URL`** (ej. Ollama: `http://127.0.0.1:11434/v1`). Si el servidor no pide token, no hace falta clave; si la pide: `OPENAI_API_KEY`, `API_KEY` o `ANTHROPIC_API_KEY` como Bearer. El nombre del modelo va en **`ANTHROPIC_MODEL`** (lo que espere el servidor).

Ejemplo **Ollama** local (copiá línea por línea):

```bash
export API_BASE_URL="http://127.0.0.1:11434/v1"

export ANTHROPIC_MODEL="llama3.2"

npx spec-driven-pipeline agent "Listá el contenido de src/ sin recursión"
```

Límites opcionales: `SPEC_AGENT_MAX_TURNS`, `SPEC_AGENT_MAX_NUDGES`, `SPEC_AGENT_MAX_VERIFICATION_GAPS`. -->

## Qué incluye el paquete

- **33 skills de arquitectura y flujo:** reglas y prompts en `templates/skills/` para que la IA respete **Clean Architecture**, **FSD**, análisis de repo, QA, riesgo, estilo y buenas prácticas de equipo (alineadas al baseline Zero-Guesswork).
- **Plantillas** de agentes por pasos del pipeline en `templates/agents/`.
- **Documentación** en el repo (enlaces abajo).
<!-- - **Código del agente** en `src/agent/` (bucle de herramientas, Anthropic u OpenAI-compatible). -->

## Desarrollo y contribución

### Instalación global del CLI

```bash
npm install -g spec-driven-pipeline
spec-driven-pipeline init
```

### Trabajar con el código fuente (npm link)

Para **probar cambios locales** del CLI antes de publicar, o usar el clon del repo sin pasar por una versión publicada:

1. Cloná e instalá:

```bash
git clone https://github.com/dgiannico19/spec-driven-pipeline.git
cd spec-driven-pipeline
npm install
```

2. En el clon:

```bash
npm link
```

3. En **otro proyecto**:

```bash
cd /ruta/a/tu-proyecto
npm link spec-driven-pipeline
```

4. Usá `npx spec-driven-pipeline` como siempre.

**Desenlazar** en el proyecto: `npm unlink spec-driven-pipeline`. En el clon del framework: `npm unlink -g` desde la carpeta del repo.

Incidencias y PRs: [issues en GitHub](https://github.com/dgiannico19/spec-driven-pipeline/issues).

## Licencia

MIT. Texto completo: [LICENSE](https://github.com/dgiannico19/spec-driven-pipeline/blob/main/LICENSE).
