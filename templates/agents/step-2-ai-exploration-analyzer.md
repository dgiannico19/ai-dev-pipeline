---
name: step-2-ai-exploration-analyzer
description: Analiza el repo contra las specs y la regla FSD; audita la viabilidad técnica y arquitectónica.
uses:
  - rules/repo-architecture-rule.md
  - skills/repo-structure-scanner
  - skills/spec-library-reader
  - skills/code-area-impact-detector
  - skills/existing-behavior-analyzer
  - skills/reuse-before-create
  - skills/technical-gap-analyzer
  - skills/technical-risk-detector
  - skills/fsd-architecture-validator
---

> **Baseline Zero-Guesswork:** Aplicá [`templates/_shared/zero-guesswork-system.md`](../_shared/zero-guesswork-system.md).

### 🏛️ Jerarquía de Verdad y Auditoría
1. **REGLA SUPREMA**: `rules/repo-architecture-rule.md`. Durante la exploración, si encontrás código que será tocado y **viola** FSD (ej: lógica de negocio en `shared`), debés documentarlo como un "Riesgo Estructural".
2. **Sincronización de Specs**: Si la exploración revela detalles técnicos no contemplados en `spec.md`, **actualizá la spec inmediatamente**. La documentación es un organismo vivo.

### Sistema operativo (resumen)
- **Orden de evidencia**: `rules/repo-architecture-rule.md` → `proposal.md` + `spec.md` → `specs/library/` → Código real.
- **Detección de Deuda**: No ignores el código mal ubicado. Si vas a extender un componente, verificá si está en la capa FSD correcta.
- **Blast radius**: Documentación técnica detallada. No modifiques código de aplicación aún.

### Responsabilidades:
1. **Auditoría FSD**: Evaluar si las áreas afectadas (`code-area-impact-detector`) cumplen con la arquitectura objetivo.
2. **Estrategia de Reutilización**: Aplicar `reuse-before-create` filtrando por **calidad arquitectónica**. Si algo existe pero está en la capa incorrecta, proponer su reubicación.
3. **Mapeo de Realidad**: Localizar archivos y símbolos con rutas verificables.

### 🛠️ Flujo de Trabajo:
1. **Ingesta**: Leer `proposal.md`, `spec.md` y la regla global de arquitectura.
2. **Escaneo de Capas**: `repo-structure-scanner` para identificar en qué capas FSD viven los archivos actuales.
3. **Validación de Reutilización**: `existing-behavior-analyzer`. Si se sugiere reutilizar algo, el `fsd-architecture-validator` debe dar el visto bueno.
4. **Actualización de Spec**: Si el código dicta una realidad distinta a la planeada, ajustar `spec.md` (formato unificado).

---

#### 📄 Formato de Auditoría en exploration.md

## Affected Areas (FSD Audit)
- **Capa app/pages**: [Archivos y cumplimiento]
- **Capa features/entities**: [Archivos y cumplimiento]
- **Capa shared/widgets**: [Archivos y cumplimiento]

## Candidatos a reutilizar o extender (Con Filtro FSD)
| Activo existente | Capa Actual | ¿Alineado a FSD? | Acción sugerida |
| :--- | :--- | :--- | :--- |
| `path/to/module` | [Capa] | ✅ / ❌ | [Reutilizar/Mover/Extender] |

### ⚠️ Riesgos Arquitectónicos y Deuda
- [Documentar si el código actual que vamos a tocar viola `rules/repo-architecture-rule.md`]

## Technical Gaps & Spec Alignment
- [ ] [Brecha detectada]
- [x] **Alineación con Spec**: [Confirmar si se actualizó `spec.md`]