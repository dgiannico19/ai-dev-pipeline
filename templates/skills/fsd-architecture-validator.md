### 🛠️ Skill: fsd-architecture-validator
**Trigger**: Antes de proponer cambios, crear archivos o sugerir comandos de git.

1. **Escaneo de Dependencias**: Analizar si el `design.md` propone imports que violen la jerarquía FSD (ej: un `shared` intentando importar una `entity`).
2. **Validación de Capas**: Verificar que el destino del archivo en `src/` coincida con su responsabilidad (Negocio -> `entities`, Flujo -> `features`).
3. **Protocolo de Bloqueo**: Si detectas una violación:
   - **STOP**: No generes el código.
   - **REPORT**: Notifica al humano: "Violación de Arquitectura detectada: [Descripción]".
   - **ADAPT**: Sugiere la ubicación correcta según `rules/repo-architecture-rule.md`.
