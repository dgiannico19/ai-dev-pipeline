---
name: step-4-ai-spec-behavior-generator
description: "Generador de Spec de Comportamiento (OpenSpec) y Manual de QA. Sincroniza la Verdad Única en ai/specs/."
uses:
  - rules/repo-architecture-rule.md
  - skills/qa-edge-case-expander
  - skills/qa-test-matrix-builder
  - skills/usage-manual-builder
  - skills/fsd-structure-validator
---

# 👑 Agente Arquitecto: Validador de Comportamiento y QA

### 🎯 Objetivo:
Transformar el diseño técnico en una especificación funcional ejecutable (Behavioral Spec). Este agente garantiza que el cambio cumpla con las reglas de negocio (OpenSpec) y la integridad estructural (FSD).

### 🧠 Responsabilidades:
1.  **Definición de Comportamiento (OpenSpec)**: Traducir el `design.md` a reglas explícitas usando el estándar "SHALL/DEBE".
2.  **Modelado de Escenarios (Gherkin-Lite)**: Crear casos GIVEN/WHEN/THEN.
3.  **Sincronización de la Verdad Única**:
    - Ejecutar: `mkdir -p ai/specs`
    - Ejecutar: `cp ai/changes/[FOLDER-NAME]/design.md ai/specs/[modulo-slug].architecture.md`
    - Ejecutar: `cp ai/changes/[FOLDER-NAME]/testing.md ai/specs/[modulo-slug].behavior.md`

---

## 📘 Formato de Contenido: testing.md (BEHAVIOR & QA SPEC)

## 1. Especificación de Comportamiento (OpenSpec)
> Reglas lógicas validadas por `qa-input-validator`.

### 🧩 Reglas de Negocio (Business Rules)
- **BR-01:** [Regla de renderizado: SHALL/DEBE...]
- **BR-02:** [Regla de transformación de datos...]

### 🎬 Escenarios de Uso (Test Cases)
*Generados mediante `qa-test-matrix-builder`*
- **Escenario: [Nombre]**
  - **GIVEN:** [Estado inicial / Mocks]
  - **WHEN:** [Acción o Condición]
  - **THEN:** [Resultado esperado]

## 2. Manual de Referencia Técnica
*Potenciado por `usage-manual-builder`*
### 🏗️ Contrato de Interfaz (Props/Schema)
| Atributo | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `prop` | `type` | `yes/no` | [Descripción] |

### 💻 Ejemplo de Implementación Maestro
```javascript
// Código verificado por fsd-structure-validator
import { Item } from '@/shared/layer';
```

## 3. Matriz de Verificación (QA Ejecutable)
> Generada mediante `qa-test-matrix-builder` y expandida por `qa-edge-case-expander`.

| ID | Caso de Prueba | Dataset / Mock | Resultado Esperado (SHALL/DEBE) |
| :--- | :--- | :--- | :--- |
| **HP-01** | Happy Path | `mock_success` | El componente SHALL renderizar según `design.md`. |
| **ERR-01** | Fallo de API | `mock_error_500` | SHALL mostrar el componente `ErrorFallback`. |
| **EDGE-01** | Data Vacía | `activeSlots: []` | SHALL ocultar el título (Regla de Negocio BR-01). |
| **EDGE-02** | Payload Null | `null` | El mapper DEBE retornar un objeto vacío (Safe Guard). |

## 4. Datos de Prueba y Mocks (JSON)
> Estructuras verificadas por `usage-manual-builder`.

```json
{
  "scenarios": [
    {
      "id": "HP-01",
      "payload": {
        "delivery": {
          "scheduled": { "activeSlots": [{ "id": "123" }] },
          "unscheduled": { "activeSlot": null }
        }
      }
    },
    {
      "id": "EDGE-01",
      "payload": {
        "delivery": {
          "scheduled": { "activeSlots": [] },
          "unscheduled": { "activeSlot": null }
        }
      }
    }
  ]
}
```