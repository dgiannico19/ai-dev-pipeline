# Guía para equipos: specs, agentes y skills propios

Esta guía complementa el [README principal](../README.md). Está pensada para **quien usa el pipeline en un repositorio de producto** (no solo para mantenedores del paquete npm).

---

## 1. Primer día en el repo

1. Clonar el proyecto y abrirlo en el IDE (Cursor, Windsurf, etc.).
2. Si aún no está instalado el pipeline: `npx spec-driven-pipeline init` (elige entorno y ubicación de agentes).
3. Siempre que cambies rutas o `step_extra_skills` en `pipeline.config.yaml`:  
   `npx spec-driven-pipeline run`  
   Eso asegura carpetas bajo `specs/`, crea `specs/config.yaml` si falta y **regenera** `specs/step-extra-skills.md`.
4. Antes de invocar un agente de un step, conviene tener abiertos o en contexto:
   - `specs/config.yaml` (reglas de stack e idioma del equipo),
   - `specs/step-extra-skills.md` (skills adicionales por agente).

---

## 2. Formato de `spec.md`

El contrato de comportamiento usa el **formato unificado** del paquete (alcance, SHALL/MUST, escenarios GIVEN/WHEN/THEN, criterios CA-XX). Detalle y plantilla: [spec-formato-unificado.md](spec-formato-unificado.md) y `templates/spec-unified-template.md` en el paquete.

---

## 3. Qué es cada cosa (mapa mental)

| Artefacto | Quién lo edita | Rol |
| :--- | :--- | :--- |
| **Agentes** en `.cursor/` (u otro IDE) | Vienen del `init`; actualizar con nueva versión del paquete si hace falta | Definen misión del step y `uses:` base (skills del pipeline). |
| **`specs/config.yaml`** | El equipo | Idioma, versiones (Node, React, …), convenciones. Lo leen todos los steps. |
| **`specs/changes/…/config.yaml`** | Por épica | Overrides o metadatos del ticket (hereda ideas de `specs/config.yaml`). |
| **`specs/skills/`** | El equipo | Markdown (u otros recursos) con procedimientos propios. |
| **`specs/rules/`** | El equipo | Reglas extra referenciadas desde skills o contexto. |
| **`pipeline.config.yaml`** | El equipo | Rutas (`docs_root`, `skills_path`, …), texto `context`, mapa **`step_extra_skills`**. |
| **`specs/step-extra-skills.md`** | **Generado** (`run`) | Lista legible: qué archivos extra cargar por **nombre de agente**. No editar a mano (se pisa al hacer `run`). |

---

## 4. Skills del paquete vs skills del equipo

- Los **skills del paquete** se instalan con los templates del IDE (rutas en `uses:` del frontmatter de cada agente). No hace falta listarlos de nuevo en `pipeline.config.yaml`.
- Los **skills del equipo** viven bajo la ruta configurada en `skills_path` (por defecto `specs/skills/`). Son archivos que vos creás (ej. `specs/skills/nuestra-definition-of-done.md`).
- Para que un step **también** use esos archivos sin tocar el frontmatter del agente, usás **`step_extra_skills`** (ver siguiente sección).

Otro equipo con otras prácticas solo cambia su `specs/skills/`, su `specs/config.yaml` y su `pipeline.config.yaml`; no necesita fork del paquete.

---

## 5. `step_extra_skills`: cómo enlazar bien

En `pipeline.config.yaml`:

```yaml
step_extra_skills:
  step-1-ai-proposal-initiator:
    - skills/checklist-producto.md
  step-5-ai-dev-executor:
    - skills/politica-tests-backend.md
    - skills/revision-api.md
```

**Regla crítica:** la clave (`step-1-ai-proposal-initiator`, `step-5-ai-dev-executor`, …) debe coincidir **exactamente** con el campo **`name:`** del frontmatter del agente en el IDE **no** con el comando `/step-…` ni con el nombre del archivo `.md` del agente, salvo que sean iguales.

Tras guardar el YAML, ejecutá `npx spec-driven-pipeline run`. Los paths bajo cada agente suelen ser relativos al repo; convención habitual: prefijo `skills/…` apuntando a archivos dentro de `specs/skills/`.

---

## 6. Flujo de una épica (resumen)

1. **Step 1:** carpeta `specs/changes/AAAA-MM-DD-slug/` con `spec.md`, `config.yaml` de épica y `proposal.md`.
2. **Steps 2–4:** `exploration.md`, `design.md`, `tasks.md`, refinar `spec.md`, `testing.md`; opcionalmente actualizar `specs/library/`.
3. **Steps 5–7:** implementación, revisión, plan de commits.
4. **Step 8:** copiar a `specs/changes/archive/[mismo-slug]/` con estructura acordada (raíz con `.openspec.yaml` + md núcleo; subcarpeta `specs/` con `spec.md` y `testing.md`); promover a `specs/library/` si aplica; **eliminar** la carpeta activa `specs/changes/[slug]`.

Detalle de archivos y comandos: agente **step-8-ai-archiver** y [README](../README.md).

---

## 7. Documentar la política **de tu** empresa

Esta guía es genérica. En el repo de producto conviene añadir (README interno o `docs/` del producto):

- Enlace a esta guía o al README del paquete.
- Qué pasos son obligatorios antes de mergear (ej. siempre Step 6).
- Naming de carpetas de épica (ticket Jira, prefijo de fecha, etc.).
- Lista de skills obligatorios del equipo y en qué steps aplican (puede repetir en comentario encima de `step_extra_skills` en YAML).

---

## 8. Problemas frecuentes

| Síntoma | Qué revisar |
| :--- | :--- |
| Los skills extra “no se usan” | ¿Corriste `run`? ¿La clave en YAML es el `name:` del agente? ¿La ruta del archivo existe? |
| No aparece `specs/step-extra-skills.md` | Ejecutá `npx spec-driven-pipeline run` desde la raíz del repo donde está `pipeline.config.yaml`. |
| Rutas raras | `docs_root` en `pipeline.config.yaml` cambia el prefijo (por defecto `specs`). Ajustá `skills_path` / `rules_path` si movés carpetas. |

---

## 9. Referencias

- [README del paquete](../README.md): instalación, tabla de rutas, lista de agentes.
- Código que genera `step-extra-skills.md`: `src/lib/specPaths.js` (`writeStepExtraSkillsMd`).
