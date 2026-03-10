---
name: new-structure-architecture
type: global-architecture-rule
alwaysApply: true
priority: highest
description: Define la arquitectura objetivo del repositorio bajo el modelo Feature Slice Design (FSD). Es la fuente de verdad transversal para diseño, implementación y revisión de código.
---

# 🏛️ Global Architecture Rule — Feature Slice Design (FSD)

## 1️⃣ Carácter obligatorio

Esta es la **arquitectura objetivo del repositorio**.

Aplica a:

- Nuevas implementaciones
- Refactors
- Pull Requests
- Code reviews
- Generación automática de código
- Decisiones técnicas

Todos los agentes y procesos deben priorizar esta regla por encima del estado actual del código.

---

## 2️⃣ Principio rector

El repositorio puede estar en transición.  
La arquitectura objetivo no lo está.

### Reglas de aplicación

- Código nuevo → cumplimiento estricto
- Código legacy → no empeorar arquitectura
- Refactors → mover hacia la arquitectura objetivo
- Reviews → exigir alineación futura

No se permiten excepciones por conveniencia.

---

## 3️⃣ Modelo arquitectónico adoptado

### Feature Slice Design (FSD)

Estructura raíz:
src/
├── app/ # Configuración global
├── pages/ # Routing únicamente
├── features/ # Funcionalidades completas
├── entities/ # Dominio de negocio
├── widgets/ # UI compleja reutilizable
└── shared/ # Infraestructura y utilidades base


---

## 4️⃣ Definición de capas

---

### 🔷 app/

Responsabilidad:
- Configuración global
- Providers
- Setup de librerías
- Inicialización de aplicación

No contiene dominio ni lógica de negocio.

---

### 🔷 pages/

Responsabilidad:
- Definición de rutas
- Composición de features

No contiene:
- Lógica de negocio
- Validaciones
- Estado complejo

---

### 🔷 features/

Representan flujos funcionales completos.

#### Son:
- Páginas funcionales
- Flujos de negocio
- Casos de uso concretos

#### Pueden:
- Usar entities
- Usar widgets
- Manejar estado específico del flujo

#### No pueden:
- Importar otras features
- Contener dominio reutilizable
- Ser usadas como librerías

Cada feature debe ser independiente.

---

### 🔷 entities/

Representan conceptos reales del negocio.

#### Contienen:
- Reglas de negocio
- Validaciones
- Modelos
- Lógica reutilizable

#### Pueden:
- Usar otras entities (solo si existe relación real de dominio)
- Tener UI simple y específica del dominio

#### No pueden:
- Depender de widgets
- Depender de features
- Contener lógica de presentación compleja
- Resolver problemas de UI

El dominio vive aquí.

---

### 🔷 widgets/

Componentes UI complejos y reutilizables.

#### Son:
- Bloques de interfaz reutilizables
- Componentes compuestos

#### Pueden:
- Tener estado interno
- Hacer API calls solo para configuración o carga visual

#### No pueden:
- Conocer reglas de negocio
- Validar dominio
- Depender de entities
- Resolver lógica de negocio

Un widget nunca debe "saber" qué entity usa.

---

### 🔷 shared/

Capa más baja del sistema.

Contiene:

- Helpers puros
- UI básica genérica
- Infraestructura
- Configuración base
- Clients HTTP
- Utilidades sin dominio

#### No puede:
- Depender de entities
- Depender de widgets
- Depender de features
- Contener lógica de negocio

Shared es transversal y agnóstico.

---

## 5️⃣ Reglas de importación (CRÍTICAS)

### ✅ Obligatorio

- Importar únicamente desde Public APIs (`index.ts` o `index.js`)
- Mantener aislamiento de capas
- Respetar dirección descendente de dependencias
- Mantener widgets genéricos
- Mantener dominio dentro de entities

---

### ❌ Prohibido

- Imports internos entre capas (`../entity/model/internal`)
- Features que importen features
- Entities que dependan de UI compleja
- Widgets específicos de una entity
- Dominio en shared
- Violaciones por rapidez o conveniencia

---

### ⚠️ Permitido con criterio estricto

- Entity → Entity (solo si existe relación real de negocio)
- Widgets con llamadas API solo para configuración
- Código altamente específico → evaluar si debe ser feature

---

## 6️⃣ Guía de decisión rápida

Si existe duda sobre ubicación:

- ¿Es regla de negocio? → entities
- ¿Es flujo funcional? → features
- ¿Es UI compleja reutilizable? → widgets
- ¿Es helper puro o infraestructura? → shared
- ¿Es routing? → pages

En caso de ambigüedad:
Priorizar aislamiento del dominio y bajo acoplamiento.

---

## 7️⃣ Antipatrones explícitos

Se consideran violaciones directas:

- Lógica de negocio en UI
- Widgets que conocen entities
- Helpers genéricos con conocimiento de dominio
- Imports cruzados entre capas
- Features dependientes entre sí
- Código nuevo siguiendo estructura legacy

---

## 8️⃣ Criterio de bloqueo

Una implementación debe ser bloqueada si:

- Viola esta arquitectura
- Introduce deuda estructural evitable
- No marca dirección clara hacia el modelo objetivo

La arquitectura tiene prioridad sobre la conveniencia.

---

## 9️⃣ Objetivo estratégico

Esta regla protege:

- Escalabilidad
- Mantenibilidad
- Evolución independiente de features
- Aislamiento del dominio
- Salud estructural del repositorio

Es la fuente de verdad transversal del sistema.
