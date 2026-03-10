# AI Dev Pipeline

[![npm](https://img.shields.io/npm/v/ai-dev-pipeline.svg)](https://www.npmjs.com/package/ai-dev-pipeline)

**AI Dev Pipeline** es una CLI que instala un pipeline de desarrollo de AI estructurado en tu proyecto.  
Detecta automáticamente el entorno AI y copia los **agents, rules y skills** necesarios para que tu equipo tenga un flujo de trabajo consistente con asistencia AI.

Actualmente soporta:

* Cursor

---

## Install

Ejecutar directamente con `npx`:

```bash
npx ai-dev-pipeline init

O instalar globalmente:

npm install -g ai-dev-pipeline

Luego correr:

ai-dev-pipeline init
```

## Usage

Desde la raíz del proyecto:

```bash
ai-dev-pipeline init
```

El CLI hará:

- Detectar el entorno AI en tu proyecto.
- Si hay varios entornos, preguntar cuál usar.
- Instalar el pipeline en el entorno seleccionado.

Ejemplo:

```
? Multiple AI environments detected. Choose where to install:
❯ cursor (Unico soportado por el momento)
  claude
```

## What Gets Installed

El CLI copia los archivos del pipeline dentro del directorio del entorno AI.
Ejemplo:

```
.cursor
   agents
   rules
   skills
```

Estos archivos definen el flujo de trabajo AI del proyecto.

Nunca sobrescribe archivos existentes. Si un archivo ya existe:

```
⚠️ Skipped existing file
```

## Supported Environments

El CLI detecta entornos buscando en la raíz del proyecto:

- `.cursor`
- `.claude`
- `.windsurf`

Si no encuentra ninguno, la instalación se detiene.

## Example Project Structure

Después de instalar, el proyecto podría verse así:

```
project/
├ .cursor/
│   ├ agents/
│   ├ rules/
│   └ skills/
├ src/
├ package.json
└ ...
```

## Philosophy

AI Dev Pipeline se basa en un principio simple:

AI debe trabajar como un equipo de ingeniería estructurado.

En lugar de depender de prompts aleatorios, el pipeline introduce roles y responsabilidades definidos, haciendo el flujo de AI predecible y mantenible.

Objetivos:

- Evitar arquitectura hallucinada
- Fomentar razonamiento estructurado
- Separar análisis de implementación
- Mejorar mantenibilidad del código generado por AI

## Contributing

¡Contribuciones bienvenidas!

Ideas de mejora:

- Nuevos agents
- Nuevas skills
- Soporte para más entornos AI
- Mejoras en el CLI (prompts interactivos, auto-updates, etc.)

Abrir issues o pull requests para colaborar.

## License

MIT