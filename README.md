# AI Dev Pipeline 🚀

[![npm](https://img.shields.io/npm/v/ai-dev-pipeline.svg)](https://www.npmjs.com/package/ai-dev-pipeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI Dev Pipeline** es una interfaz de línea de comandos (CLI) diseñada para instalar un flujo de trabajo de Inteligencia Artificial estructurado en tu repositorio. 

Detecta automáticamente tu editor (IDE) y despliega **agentes, reglas y habilidades (skills)** que permiten a la IA razonar como un equipo de ingeniería senior, separando el análisis de la ejecución.

### 🛠 Entornos Soportados
* **Cursor** (Reglas y Agentes personalizados)
* **Windsurf** (Cascade Context)
* **Claude Code**

---

## 📥 Instalación

Puedes ejecutarlo directamente sin instalar usando `npx`:

```bash
npx ai-dev-pipeline init

O instalar globalmente:

Bash
npm install -g ai-dev-pipeline
ai-dev-pipeline init
```

---
## 📁 Estructura del Workflow (Directorio `ai/`)

El pipeline establece una **fuente de verdad única** dentro de la carpeta `ai/` de tu proyecto. Esto evita "ensuciar" la raíz y mantiene el contexto organizado para el IDE:

| Directorio | Propósito |
| :--- | :--- |
| **`ai/changes/`** | **Espacio activo.** Aquí es donde los agentes trabajan en la épica actual. |
| **`ai/specs/`** | **Librería de diseño.** Contiene la documentación técnica final de tus componentes. |
| **`ai/archive/`** | **Memoria histórica.** Épicas finalizadas que sirven de contexto para futuras tareas. |

---

## 🤖 Los 7 Agentes del Pipeline

Al inicializar el proyecto, los siguientes agentes estarán disponibles en tu IDE para ser invocados mediante comandos de chat:

### 🏗️ 1. **Iniciador de Propuesta** (Step 1)
* **Comando:** `/step-1-ai-proposal-initiator`
* **Misión:** Analizar el ticket o historia de usuario desde el punto de vista de negocio.
* **Resultado:** Crea la carpeta de la épica y el archivo `proposal.md`. Define el **"Por qué"** (negocio) y las nuevas **Capabilities** (capacidades) del sistema.

### 🔍 2. **Analizador de Exploración** (Step 2)
* **Comando:** `/step-2-ai-exploration-analizer`
* **Misión:** Escanear el código real para ver dónde impactará el cambio.
* **Resultado:** Genera `exploration.md`. Identifica archivos afectados, lógica actual y brechas técnicas.

### 🧠 3. **Constructor de Diseño** (Step 3)
* **Comando:** `/step-3-ai-designer-builder`
* **Misión:** El arquitecto. Decide **CÓMO** se resolverá el problema.
* **Resultado:** Genera `design.md` (decisiones técnicas) y `tasks.md` (el checklist de tareas `[ ]`).

### 📘 4. **Generador de QA y Manuales** (Step 4)
* **Comando:** `/step-4-ai-qa-manual-generator`
* **Misión:** Traducir el diseño en pasos de prueba y documentación de uso.
* **Resultado:** Genera `testing.md`. Incluye una matriz de pruebas y ejemplos de esquemas (YAML/JSON) para validar sin leer código.

### 🔨 5. **Ejecutor de Desarrollo** (Step 5)
* **Comando:** `/step-5-ai-dev-executor`
* **Misión:** El programador. Escribe el código siguiendo el diseño.
* **Resultado:** Implementa cambios en el repo y **marca con `[x]`** las tareas completadas en el `tasks.md`.

### 🛡️ 6. **Revisor Estricto** (Step 6)
* **Comando:** `/step-6-ai-strict-reviewer`
* **Misión:** El guardián de calidad (Gatekeeper).
* **Resultado:** Reporte de auditoría. Bloquea el proceso si el código no coincide con el diseño o si faltan tareas por tildar. Detecta errores de estilo (`const`, early returns, etc).

### 📦 7. **Organizador de Commits y Archivo** (Step 7)
* **Comando:** `/step-7-ai-commit-splitter`
* **Misión:** Notario de cierre. Organiza la historia y limpia el área de trabajo.
* **Resultado:** Genera el plan de **Conventional Commits** y mueve la épica de `changes/` a `archive/` para liberar el espacio de trabajo.

### 📦 8. Archivador de Conocimiento (Step 8)
* **Comando:** `/step-8-ai-archiver`
* **Misión:** Bibliotecario. Cierra el ciclo de vida de la épica.
* **Resultado:** Mueve la documentación a `ai/archive/` (incluyendo una copia de la spec final) y limpia el área de cambios activos.

---
## 🛠️ Arquitectura de Agentes y Skills

Como Staff Engineer, diseñé este pipeline para que cada agente sea un especialista modular, compuesto por skills técnicas reutilizables. A continuación, detallo los 8 steps del pipeline, con sus skills subyacentes que ejecutan la lógica de bajo nivel.

### Step 1: Proposal
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| epic-input-validator | Valida la estructura y completitud del ticket de entrada, asegurando que cumpla con estándares de definición de épicas. |
| ai-path-generator | Genera automáticamente la ruta de directorio en `ai/changes/` basada en el identificador de la épica. |
| epic-scope-analyzer | Analiza el alcance del ticket para definir claramente el "Why" (justificación de negocio) y el "What" (capacidades técnicas requeridas). |
| epic-domain-extractor | Extrae el dominio de negocio del ticket para contextualizar la épica dentro de la arquitectura del sistema. |
| analysis-input-validator | Valida los inputs de análisis para garantizar consistencia antes de procesar la propuesta. |

</details>

### Step 2: Exploration
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| spec-library-reader | Lee y parsea la documentación existente en `ai/specs/` para contextualizar el análisis. |
| repo-structure-scanner | Escanea la estructura del repositorio para mapear archivos relevantes y dependencias. |
| technical-gap-analyzer | Detecta brechas técnicas, deudas técnicas y riesgos de arquitectura en el código base actual. |
| existing-behavior-analyzer | Analiza el comportamiento existente del código para identificar patrones y lógica actual. |
| code-area-impact-detector | Detecta áreas del código que serán impactadas por los cambios propuestos. |
| technical-risk-detector | Identifica riesgos técnicos potenciales en la implementación del cambio. |

</details>

### Step 3: Design
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| technical-decision-maker | Evalúa y selecciona patrones de arquitectura apropiados (FSD, Clean Code, etc.) basados en el contexto del proyecto. |
| task-list-generator | Genera un checklist estructurado en `tasks.md` con tareas específicas y verificables. |
| fsd-architecture-planner | Planifica la arquitectura siguiendo el patrón Feature-Sliced Design para modularidad. |
| fsd-structure-validator | Valida que la estructura propuesta cumpla con las reglas de Feature-Sliced Design. |
| functional-objective-consolidator | Consolida objetivos funcionales en un diseño coherente y priorizado. |
| risk-mitigation-planner | Planifica estrategias para mitigar riesgos identificados en el diseño. |

</details>

### Step 4: QA/Manual
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| qa-test-matrix-builder | Construye una matriz completa de casos de prueba cubriendo escenarios funcionales y edge cases. |
| usage-manual-builder | Genera documentación de uso detallada con ejemplos de esquemas (YAML/JSON) para validación. |
| qa-edge-case-expander | Expande la cobertura de pruebas identificando y documentando casos extremos. |
| qa-input-validator | Valida los inputs de calidad para asegurar que las pruebas sean ejecutables y relevantes. |

</details>

### Step 5: Executor
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| repo-code-analyzer | Analiza el código base para identificar puntos óptimos de inserción y modificación. |
| task-progress-updater | Actualiza el estado de tareas en `tasks.md`, marcando completadas con `[x]`. |
| code-style-enforcer | Aplica reglas de estilo de código como early returns, uso de `const` y patrones de legibilidad. |
| minimal-change-implementer | Implementa cambios con el mínimo impacto posible en el código existente. |

</details>

### Step 6: Reviewer
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| diff-change-detector | Compara el código implementado contra el diseño especificado para detectar desviaciones. |
| code-style-reviewer | Realiza auditoría de calidad de código enfocada en consistencia y mejores prácticas. |
| task-completion-verifier | Verifica que todas las tareas en `tasks.md` estén completadas antes de permitir el avance. |
| review-report-builder | Construye un reporte detallado de la revisión con hallazgos y recomendaciones. |
| steps-alignment-reviewer | Revisa la alineación entre los diferentes steps del pipeline para asegurar coherencia. |

</details>

### Step 7: Commit Splitter
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| conventional-commit-generator | Genera mensajes de commit siguiendo el estándar Conventional Commits (feat, fix, etc.). |

</details>

### Step 8: Archiver
<details>
<summary>Skills utilizadas en este paso</summary>

| Skill | Descripción Técnica |
|-------|---------------------|
| ai-archiver | Mueve la épica completa de `ai/changes/` a `ai/archive/` para preservar el historial. |

</details>

---
##  🔄 El Ciclo de Vida de las Specs
A diferencia de otros sistemas, aquí la documentación técnica no es estática, es evolutiva:

Nacimiento (Step 4): El diseño aprobado se "promociona" a ai/specs/ como la nueva verdad oficial del sistema.

Consulta (Step 2): En futuras épicas, la IA lee primero ai/specs/ para no romper reglas de arquitectura previas.

Persistencia (Step 8): Al archivar, se guarda una copia de la spec dentro de la carpeta histórica, permitiendo auditorías de "cómo se veía el sistema en esta fecha".

---

## 🧠 Filosofía: El Archivo como Memoria IA

¿Por qué archivamos? El desarrollador humano olvida, pero **la IA del futuro tiene memoria infinita**.

* **Contexto Permanente:** En futuros cambios, la IA consultará el `archive/` para entender por qué se tomó una decisión técnica hace meses.
* **Cero Alucinaciones:** La IA no inventará reglas; se basará en el historial documentado de tu propio proyecto.
* **Onboarding Veloz:** Cualquier nuevo integrante del equipo (humano o IA) puede entender la arquitectura leyendo la evolución en la carpeta `ai/`.

---

## 🤝 Contribuciones
¡Las ideas son bienvenidas! Si quieres agregar soporte para nuevos IDEs o mejorar los prompts de los agentes, abre un **Issue** o envía un **Pull Request**.

## 📄 Licencia
Distribuido bajo la licencia **MIT**.