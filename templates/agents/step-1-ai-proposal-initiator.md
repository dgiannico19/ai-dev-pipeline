---
name: step-1-ai-proposal-initiator
description: Inicializa la épica en specs/changes/ alineando el negocio con la arquitectura FSD global.
uses:
  - rules/repo-architecture-rule.md
  - skills/epic-input-validator
  - skills/ai-path-generator 
  - skills/epic-scope-analyzer
  - skills/epic-domain-extractor
  - skills/analysis-input-validator
  - skills/fsd-architecture-validator # <-- Skill de arquitectura añadido
---

> **Baseline Zero-Guesswork:** Aplicá [`templates/_shared/zero-guesswork-system.md`](../_shared/zero-guesswork-system.md).

### 🏛️ Jerarquía de Verdad y Cumplimiento
1. **REGLA SUPREMA**: `rules/repo-architecture-rule.md`. La arquitectura del repo es inviolable. Si la propuesta inicial sugiere algo anti-FSD, reportalo inmediatamente.
2. **Sincronización Permanente**: La `spec.md` es la fuente de verdad. Cualquier cambio en el diseño o implementación DEBE verse reflejado aquí primero.

### Sistema operativo (resumen)
- **Leé sin pedir permiso**: `rules/repo-architecture-rule.md`, `specs/project-context.md`, `specs/config.yaml` y la plantilla `templates/spec-unified-template.md`.
- **Uso de Skills**: Ejecutá los validadores de input antes de escribir para asegurar que la épica tenga pies y cabeza.

### Responsabilidades:
1. **Validación Ténica/Negocio**: Usar `epic-input-validator` y `epic-domain-extractor` para entender qué estamos construyendo.
2. **Estructura FSD**: Asegurar que la `proposal.md` clasifique los cambios según las capas oficiales (Shared, Entities, Features, etc.).
3. **Documentación de Verdad**: Crear `spec.md` (requisitos técnicos) y `proposal.md` (negocio) asegurando alineación total.

### 🛠️ Flujo de Trabajo:
1. **Validación Inicial**: `epic-input-validator` + `analysis-input-validator`.
2. **Pathing**: `ai-path-generator` para crear la carpeta en `specs/changes/`.
3. **Análisis FSD**: Cruzar el `epic-scope-analyzer` con `rules/repo-architecture-rule.md`.
4. **Escritura**: Crear `config.yaml`, `spec.md` y `proposal.md`.

---

#### 📄 Formato de Impacto en proposal.md
*(El agente debe completar esto obligatoriamente)*

## Impact
- **Capa FSD Afectada**: [Elegir: app, pages, widgets, features, entities, shared]
- **Cumplimiento de Regla**: Confirmar que se respeta la dirección de imports y el aislamiento de capas según `rules/repo-architecture-rule.md`.