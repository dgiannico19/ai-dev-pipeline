---
name: step-4-ai-spec-behavior-generator
description: "Refina spec.md con comportamiento verificable, genera testing.md (QA) y sincroniza fragmentos relevantes en specs/library/."
uses:
  - rules/repo-architecture-rule.md
  - skills/qa-edge-case-expander
  - skills/qa-test-matrix-builder
  - skills/usage-manual-builder
  - skills/fsd-structure-validator
---

> **Baseline Zero-Guesswork:** Aplicá [`templates/_shared/zero-guesswork-system.md`](../_shared/zero-guesswork-system.md).

### Sistema operativo (resumen)
- **Trazabilidad CA ↔ escenarios**: cada **CA-XX** en `spec.md` debe mapear a filas/casos en `testing.md` con IDs explícitos (sin “TBD” silencioso).
- **No inventes comportamiento**: todo SHALL/MUST debe poder citar origen en `design.md` o acuerdo explícito en `spec.md`.
- **Blast radius**: `testing.md` cubre **solo** lo que la épica define; no añadas suites enteras fuera de scope.
- **Librería**: copiar a `specs/library/` solo contratos **estables** y con ruta/nombre acordados — verificá que el destino no sobrescriba doc ajena sin intención.

# Agente: Comportamiento, QA y librería

### Objetivo
Completar la **spec vinculante** (`spec.md`) con reglas y escenarios verificables, producir `testing.md` para ejecución/manual QA, y reflejar en `specs/library/` lo que el equipo considere verdad reutilizable (sin depender de carpetas `openspec/`).

### Contexto de equipo
- Lee `specs/config.yaml` y el `config.yaml` de la épica.
- Consulta `specs/step-extra-skills.md` para skills extra de este agente.

### Fuentes
- `specs/changes/[FOLDER-NAME]/design.md`, `spec.md`, `tasks.md`.

### Salidas
- **Actualizar** `spec.md` al **formato unificado** (`templates/spec-unified-template.md`): cada requisito con SHALL/MUST y, bajo cada **Requirement**, escenarios con **GIVEN / AND / WHEN / THEN / AND**. Mantener **CA-XX** alineados con `testing.md`.
- **Crear o actualizar** `testing.md` (matriz QA, escenarios, manual técnico).
- **Opcional pero recomendado**: copiar o fundir en `specs/library/[modulo-slug].md` el contrato estable (según naming del equipo).

### Sincronización con la librería (ejemplo)

```bash
mkdir -p specs/library
# Ejemplo: consolidar spec de módulo (ajusta el slug)
cp specs/changes/[FOLDER-NAME]/spec.md specs/library/[modulo-slug].md
# O mantener design + behavior en archivos separados si así lo define el equipo:
# cp specs/changes/[FOLDER-NAME]/design.md specs/library/[modulo-slug].architecture.md
# cp specs/changes/[FOLDER-NAME]/testing.md specs/library/[modulo-slug].qa.md
```

---

## Formato de contenido: testing.md (comportamiento y QA)

## 1. Reglas de negocio / comportamiento
> Debe ser **trazable** a `spec.md`: mismos RF/Requirement y escenarios GIVEN/WHEN/THEN.

### Reglas (opcional; o referencia directa a spec.md)
- **BR-01:** [o: ver Requirement (RF-01) en spec.md]

### Escenarios de prueba (espejo o extensión del spec)
- **Escenario: [Nombre]** (alinear con `#### Scenario` del spec)
  - **GIVEN:** …
  - **WHEN:** …
  - **THEN:** …

## 2. Manual de referencia técnica
*Potenciado por `usage-manual-builder`*

### Contrato de interfaz (Props/Schema)
| Atributo | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `prop` | `type` | yes/no | … |

### Ejemplo de implementación
```javascript
// Verificado por fsd-structure-validator
import { Item } from '@/shared/layer';
```

## 3. Matriz de verificación

| ID | Caso | Dataset / Mock | Resultado esperado |
| :--- | :--- | :--- | :--- |
| **HP-01** | Happy path | … | … |
| **ERR-01** | Error API | … | … |

## 4. Datos de prueba (JSON)

```json
{
  "scenarios": []
}
```
