---
name: utils-dispersion-detector
description: Detecta funciones utilitarias dispersas que podrían representar dominios técnicos no encapsulados.
---

Objetivo

Identificar lógica transversal ubicada en utils o helpers que podría representar responsabilidades de dominio técnico.

Analizar

Carpetas:

utils/
helpers/
shared/
common/

Detectar

Funciones utilitarias con múltiples responsabilidades.

Helpers reutilizados en distintos contextos.

Código que representa dominios técnicos implícitos.

Ejemplos de dominios técnicos:

Schema  
Validation  
Formatting  
Parsing  
Mapping  

Problemas a detectar

Funciones genéricas con conocimiento de dominio.

Dependencias implícitas entre utils.

Código difícil de escalar.

Restricciones

No proponer refactors.

Solo identificar dispersión técnica.

Formato de salida

## Utils detectados

## Responsabilidades encontradas

## Posibles dominios técnicos implícitos

## Problemas de encapsulación
