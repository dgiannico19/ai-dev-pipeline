---
name: step-4-ai-spec-behavior-generator
description: Refina spec.md con comportamiento verificable, genera testing.md y asegura que la librería global herede contratos FSD válidos.
uses:
  - rules/repo-architecture-rule.md
  - skills/qa-edge-case-expander
  - skills/qa-test-matrix-builder
  - skills/usage-manual-builder
  - skills/fsd-structure-validator
  - skills/fsd-architecture-validator
---

> **Baseline Zero-Guesswork:** Aplicá [`templates/_shared/zero-guesswork-system.md`](../_shared/zero-guesswork-system.md).

### 🏛️ Jerarquía de Verdad y Blindaje de Contratos
1. **REGLA SUPREMA**: `rules/repo-architecture-rule.md`. Los ejemplos de implementación en el "Manual Técnico" y los archivos en `specs/library/` DEBEN respetar las capas FSD. Prohibido documentar ejemplos que importen desde rutas internas.
2. **Sincronización Total**: Este agente es el responsable final de que `spec.md`, `testing.md` y la `library/` estén en perfecta sintonía. Si un escenario de prueba revela un borde no cubierto, la `spec.md` debe actualizarse primero.

### Sistema operativo (resumen)
- **Trazabilidad Inquebrantable**: Cada **CA-XX** (Criterio de Aceptación) en `spec.md` debe tener su contraparte exacta en `testing.md`.
- **Validación FSD en Docs**: Antes de guardar `testing.md`, el `fsd-architecture-validator` debe verificar que los fragmentos de código (imports/exports) sigan la regla global.
- **Librería**: Solo se promocionan a `specs/library/` aquellos contratos que sean "Public API" (`index.ts`).

### Responsabilidades:
1. **Refinamiento de Comportamiento**: Completar `spec.md` con escenarios GIVEN/WHEN/THEN que cubran casos de éxito y error.
2. **Manual de Uso Técnico**: Crear ejemplos de código en `testing.md` que sirvan de guía para el Step 5, asegurando que los componentes sean usados como "Ciegos" o "Inyectados" según FSD.
3. **QA Matrix**: Generar la matriz de verificación vinculada a los IDs de la spec.
4. **Promoción a Librería**: Actualizar `specs/library/` con el contrato estable de la nueva funcionalidad.

### 🛠️ Flujo de Trabajo:
1. **Ingesta**: Leer `design.md`, `spec.md` y `tasks.md`.
2. **Expansión QA**: `qa-edge-case-expander` para encontrar escenarios de borde (error de red, datos corruptos, etc.).
3. **Construcción de Manual**: `usage-manual-builder` asegurando que los ejemplos cumplan con `rules/repo-architecture-rule.md`.
4. **Sincronización Final**: 
   - Actualizar `spec.md` (SHALL/MUST y Escenarios).
   - Crear/Actualizar `testing.md`.
   - Copiar contrato validado a `specs/library/[modulo].md`.

---

#### 📄 Ajuste en testing.md: Verificación y Referencia

### Matriz de verificación (Trazable)

| ID Spec | ID Test | Caso | Resultado esperado |
| :--- | :--- | :--- | :--- |
| **CA-01** | **HP-01** | [Happy Path] | [OK] |
| **CA-02** | **ERR-01** | [Error de Validación] | [Mensaje correcto] |

---

### Ejemplo de implementación (FSD Compliant)

```typescript
// ✅ Verificado por fsd-architecture-validator
// Importación desde Public API - Correcto según Layering
import { MyFeature } from '@/features/my-feature'; 

// Ejemplo de uso respetando desacoplamiento:
const Example = () => <MyFeature onAction={handleAction} />;
```