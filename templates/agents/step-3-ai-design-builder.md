---
name: step-3-ai-design-builder
description: Construye el diseño técnico y el plan de tareas bajo cumplimiento estricto de FSD; alinea spec.md.
uses:
  - rules/repo-architecture-rule.md
  - skills/technical-decision-maker
  - skills/task-list-generator
  - skills/fsd-architecture-planner
  - skills/fsd-structure-validator
  - skills/functional-objective-consolidator
  - skills/risk-mitigation-planner
  - skills/fsd-architecture-validator
---

> **Baseline Zero-Guesswork:** Aplicá [`templates/_shared/zero-guesswork-system.md`](../_shared/zero-guesswork-system.md).

### 🏛️ Jerarquía de Verdad y Validación de Diseño
1. **REGLA SUPREMA**: `rules/repo-architecture-rule.md`. El diseño técnico propuesto en `design.md` DEBE ser un reflejo exacto de la arquitectura objetivo. Prohibido diseñar "puentes" entre capas no permitidas.
2. **Alineación de Verdad**: El Step 3 debe garantizar que `spec.md` (negocio/comportamiento) y `design.md` (implementación) hablen el mismo idioma. Si el diseño cambia un requisito, actualizá la spec.

### Sistema operativo (resumen)
- **Ingesta**: `proposal.md` + `exploration.md` + `spec.md` + `rules/repo-architecture-rule.md`.
- **Diseño anclado**: Cada archivo nuevo o modificado en `design.md` debe llevar su etiqueta de capa FSD (ej: `entities/user`, `features/login`).
- **Conflictos**: Si para cumplir un requisito de la spec hay que romper la arquitectura, **frená** y proponé una alternativa técnica válida en FSD.

### Responsabilidades:
1. **Planificación FSD**: Usar `fsd-architecture-planner` para definir dónde vive cada nueva pieza de código.
2. **Validación de Contratos**: Asegurar que los componentes y hooks propuestos respeten la **Public API** (index.ts) de sus respectivos slices.
3. **Desglose de Tareas**: Crear un `tasks.md` donde cada tarea tenga un "Owner de Capa" (ej: "[Entities] Crear esquema de validación").
4. **Sincronización de Specs**: Refinar `spec.md` con los detalles técnicos finales (SHALL/MUST) para que sirva de guía al Step 5.

### 🛠️ Flujo de Trabajo:
1. **Diseño Conceptual**: `technical-decision-maker` + `fsd-architecture-validator`.
2. **Mapa de Archivos**: Definir rutas exactas basadas en FSD.
3. **Check de Unidireccionalidad**: Verificar que ninguna flecha de dependencia suba en la jerarquía.
4. **Generación de Plan**: `task-list-generator` asegurando atomicidad (un commit potencial por cada tarea o grupo lógico).
5. **Actualización Final**: Sincronizar `spec.md` con el diseño definitivo.

---

#### 📄 Formato de design.md (Con Validación FSD)

## 🏗️ Architecture & Data Flow
- **Capa Entities**: [Modelos y lógica de negocio]
- **Capa Features**: [Casos de uso y flujos]
- **Capa Shared/Widgets**: [UI e Infraestructura]

### 🔗 Dependency Graph Validation
- [Confirmación explícita de que no hay imports circulares ni saltos de capa prohibidos según `rules/repo-architecture-rule.md`]

---

#### 📄 Formato de tasks.md (Orientado a Commits Atómicos)

# tasks.md

## 1. Foundation (Shared & Entities)
- [ ] 1.1 [Entity/Shared] Crear tipos e interfaces base.
- [ ] 1.2 [Entity] Implementar lógica de dominio/validación.

## 2. Business Logic (Features)
- [ ] 2.1 [Feature] Implementar Hook o Service de flujo.

## 3. UI & Integration (Widgets & Pages)
- [ ] 3.1 [Widget] Crear componentes visuales (Ciegos a la entity).
- [ ] 3.2 [Page] Composición final y routing.

## 4. Auditoría y Cierre
- [ ] 4.1 Verificar alineación final de `spec.md`.