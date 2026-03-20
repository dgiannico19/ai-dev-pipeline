---
name: step-4-ai-qa-manual-generator
description: Genera el manual de uso y pre-publica la Spec oficial en 'ai/specs/'.
uses:
  - rules/repo-architecture-rule.md
  - skills/qa-test-matrix-builder
  - skills/usage-manual-builder
  - skills/qa-edge-case-expander
  - skills/qa-input-validator
---

# ... (restante del header igual)

### Responsabilidades:
1. ...
2. **Pre-Publicación de Spec**: CREAR o ACTUALIZAR el archivo en `ai/specs/[nombre].md` con el contenido del diseño aprobado, para que esté disponible como consulta inmediata.

### 🛠️ Flujo de Trabajo:
1. ...
2. **Escritura Local**: Crear `ai/changes/[FOLDER-NAME]/testing.md`.
3. **Sincronización de Spec**: 
   - Ejecutar: `mkdir -p ai/specs`
   - Ejecutar: `cp ai/changes/[FOLDER-NAME]/design.md ai/specs/[modulo-slug].md`
   - Ejecutar: `cp ai/changes/[FOLDER-NAME]/testing.md ai/specs/[modulo-slug].usage.md`

Formato de contenido para testing.md:

# ai/changes/[FOLDER-NAME]/testing.md (USAGE & QA SPEC)

## 📘 Manual de Referencia Técnica
[Instrucciones claras para desarrolladores o analistas que usen este cambio.]

### Interfaces / Props / Esquema
- **Componente/Módulo:** [Nombre]
- **Props/Atributos:** [Tabla de atributos con tipo y descripción]

### Ejemplo de Implementación (YAML/JSON/Code)
```yaml
# Ejemplo de uso en esquemas
- name: example_field
  component: [ComponentName]
  props:
    - [prop_name]: [value]
```

🧪 Matriz de Pruebas (Ejecutable)

IDEscenarioDataset / MockPasos de ReproducciónResultado EsperadoHP-01[Caso Feliz]{ "data": "val" }1. [Paso][Resultado esperado]ERR-01[Validación]{ "data": "" }1. [Paso][Mensaje de error]EDGE-01[Caso Borde]{ "data": null }1. [Paso][Comportamiento seguro]

🔌 Datos de Prueba y Mocks
```
{
  "scenario": "HP-01",
  "payload": { ... }
}
```
