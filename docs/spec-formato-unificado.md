# Formato unificado de `spec.md`

El paquete recomienda un único formato que combina:

1. **Claridad de producto** (alcance dentro/fuera, no objetivos, criterios de aceptación numerados).
2. **Precisión verificable** (requisitos con **SHALL/MUST** y escenarios **GIVEN / AND / WHEN / THEN**, alineado con buenas prácticas tipo OpenSpec / BDD).

## Dónde está la plantilla canónica

En el repositorio del paquete: [`templates/spec-unified-template.md`](../templates/spec-unified-template.md).

Tras `npx spec-driven-pipeline init`, podés copiarla a tu épica como base:

```bash
cp node_modules/spec-driven-pipeline/templates/spec-unified-template.md specs/changes/[TU-EPICA]/spec.md
```

(Si no usás `node_modules`, copiá desde el repo fuente del paquete.)

## Rol de cada step

| Step | Qué aporta al `spec.md` |
| :--- | :--- |
| **1** | Título, estado, Propósito, Alcance, primeros Requirements o placeholders; CA iniciales si ya se conocen. |
| **2** | Ajustar alcance y riesgos según código y `specs/library/`; nuevos escenarios si aparecen huecos. |
| **3** | Alinear requisitos con decisiones técnicas sin duplicar todo `design.md`; notas de trazabilidad. |
| **4** | Completar SHALL/MUST, escenarios GIVEN/WHEN/THEN, CA verificables y coherencia con `testing.md`. |

## Relación con `testing.md`

- `spec.md` = **contrato** (qué debe cumplir el sistema).
- `testing.md` = **cómo se prueba** (matrices, datasets, pasos manuales). Los IDs **CA-XX** y **RF-XX** deben poder cruzarse entre ambos archivos.

## Ejemplos de referencia

Los archivos `src/commands/openspecSpec-example.md` y `src/commands/myspec.md` en el repo de desarrollo del paquete son ejemplos históricos; la fuente de verdad del formato es **`templates/spec-unified-template.md`**.
