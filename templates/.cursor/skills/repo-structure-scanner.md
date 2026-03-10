---
name: repo-structure-scanner
description: Escanea la estructura del repositorio para identificar capas arquitectónicas, módulos existentes y organización general del código.
uses:
  - rules/repo-architecture-rule.md
---

Objetivo

Analizar la estructura real del repositorio para identificar cómo está organizado el código actualmente.

Analizar

Estructura de carpetas bajo `src/`.

Identificar:

- app
- pages
- features
- entities
- widgets
- shared

Detectar:

- módulos existentes
- features implementadas
- entidades del dominio
- widgets reutilizables
- infraestructura compartida

Evaluar también:

- presencia de carpetas utils o helpers
- carpetas de infraestructura
- módulos técnicos relevantes

Restricciones

No inferir comportamiento funcional.

Solo describir organización técnica real.

Formato de salida

## Estructura del repositorio

### app

### pages

### features

### entities

### widgets

### shared

### otras carpetas relevantes
