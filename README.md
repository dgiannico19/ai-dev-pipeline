# Spec-Driven Pipeline 🚀

[![npm](https://img.shields.io/npm/v/spec-driven-pipeline.svg)](https://www.npmjs.com/package/spec-driven-pipeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Spec-Driven Pipeline** es una CLI para instalar un flujo de trabajo **centrado en `spec.md` y la carpeta `specs/`**: agentes por steps, reglas, skills y sincronización con el IDE (Cursor, Windsurf, Claude Code).

**Guía para equipos** (onboarding, `config.yaml`, skills propios, `step_extra_skills`, archivo): [docs/guia-equipos.md](docs/guia-equipos.md).

**Formato de `spec.md`** (OpenSpec-style + alcance/CA): [docs/spec-formato-unificado.md](docs/spec-formato-unificado.md) · plantilla: [templates/spec-unified-template.md](templates/spec-unified-template.md).

## 🛠 Entornos Soportados

- **Cursor** (Reglas y Agentes) | **Windsurf** (Cascade) | **Claude Code**

---

## 📥 Instalación

Puedes ejecutarlo directamente sin instalar usando `npx`:

```bash
npx spec-driven-pipeline init
npx spec-driven-pipeline run
```

`run` (alias `sync`) crea el árbol bajo `specs/` si falta, genera `specs/config.yaml` de equipo y actualiza `specs/step-extra-skills.md` a partir de `pipeline.config.yaml`.

> Publicado en npm como **`spec-driven-pipeline`**. Si venías de `ai-dev-pipeline`, migrá los comandos `npx` al nombre nuevo.

---

## 📁 Estructura del workflow (directorio `specs/`)

La documentación vive bajo **`specs/`** (antes `ai/` en versiones anteriores). La **fuente de verdad del comportamiento** es `spec.md` dentro de cada épica; nace en el Step 1 y se refina en los siguientes. Al archivar, la config de épica se guarda como **`.openspec.yaml`** en la raíz del directorio archivado (snapshot; no implica usar la carpeta `openspec/` en la raíz del repo).

| Ruta | Propósito |
| :--- | :--- |
| **specs/changes/** | Épica activa (una carpeta por cambio; no mezclar con `archive/`). |
| **specs/changes/archive/** | Histórico por épica: raíz con proposal/design/tasks/exploration + **`.openspec.yaml`**, y subcarpeta **`specs/`** con `spec.md`, `testing.md`, etc. |
| **specs/library/** | Librería viva entre épicas (antes `ai/specs/`). |
| **specs/skills/** | Skills propios del equipo (Markdown u otros recursos que referencies). |
| **specs/rules/** | Reglas adicionales del equipo. |
| **specs/config.yaml** | Stack, idioma y convenciones para el “spect agent” (lectura en todos los steps). |
| **specs/step-extra-skills.md** | Índice generado: skills **extra** por agente (desde `pipeline.config.yaml`). |

### Migración desde `ai/`

Si ya tenías `ai/changes`, `ai/specs`, etc., renombra la carpeta raíz a `specs/` y renombra `ai/specs` → `specs/library`. Si usabas `specs/archive/` en la raíz del docs tree, mueve el contenido a **`specs/changes/archive/`**. Actualiza `pipeline.config.yaml` y ejecuta `npx spec-driven-pipeline run`.

---

## ⚙️ Configuración: `pipeline.config.yaml`

Además del texto libre en `context`, puedes fijar rutas y **skills adicionales por step** (sin fork del paquete):

```yaml
docs_root: specs
library_dir: library
skills_path: specs/skills
rules_path: specs/rules
step_extra_skills:
  step-1-ai-proposal-initiator:
    - skills/mi-checklist-onboarding.md
  step-5-ai-dev-executor:
    - skills/nuestra-politica-de-tests.md
```

Las claves bajo `step_extra_skills` deben coincidir con el campo `name:` del agente. Tras editar, ejecuta `npx spec-driven-pipeline run` para regenerar `specs/step-extra-skills.md`.

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

## 🔄 Ciclo de vida de la spec

1. **Step 1:** Aparece `spec.md` (borrador) como contrato vivo junto al negocio en `proposal.md`.
2. **Steps 2–3:** Exploración y diseño alimentan y ajustan `spec.md`.
3. **Step 4:** Comportamiento verificable y `testing.md`; sincronización con `specs/library/`.
4. **Step 8:** Copia estructurada a `specs/changes/archive/` y borrado total de la épica en `specs/changes/`; librería actualizada en `library/`.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**.
