---
name: epic-input-validator
description: Valida que el archivo de épica o historia exista y tenga contenido antes de iniciar el análisis.
---

Objetivo

Verificar que el archivo proporcionado por el usuario exista y contenga información suficiente para ser analizado.

Validaciones

- El archivo indicado existe.
- El archivo contiene texto.
- El contenido describe una épica o historia funcional.

Si falla alguna validación:

- Informar el error claramente.
- No continuar el análisis.

Restricciones

No asumir contenido inexistente.
No inferir épicas desde descripciones vagas.

Salida esperada

Confirmación de que el archivo es válido para análisis.
