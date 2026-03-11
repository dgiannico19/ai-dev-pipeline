---
name: fsd-architecture-planner
description: Proposes a conceptual responsibility distribution based on the repository architecture rules.
---

# FSD Architecture Planner

## Objective

Define how the epic responsibilities should be organized inside the target repository architecture.

This skill does NOT define a new architecture.

This skill interprets the epic within the existing architecture defined in:

rules/repo-architecture-rule.md

## Rules to follow

You MUST follow:

rules/repo-architecture-rule.md

Do not propose structures that violate these rules.

## Required Analysis

Determine which responsibilities conceptually belong to:

- features/
- entities/
- widgets/
- shared/
- pages/

For each layer explain:

- What type of logic should live there
- Which epic responsibilities belong there
- Which responsibilities should NOT be placed there

## Constraints

- Do NOT define real file paths
- Do NOT list concrete files
- Do NOT invent modules
- Do NOT propose architecture changes
- Do NOT violate repo-architecture-rule.md
- Stay at conceptual architecture level only

## Output Format

## Conceptual Architecture Distribution

### features

Responsibilities that belong here:

Responsibilities that should NOT be here:

### entities

Responsibilities that belong here:

Responsibilities that should NOT be here:

### widgets

Responsibilities that belong here:

Responsibilities that should NOT be here:

### shared

Responsibilities that belong here:

Responsibilities that should NOT be here:

### pages

Responsibilities that belong here:

Responsibilities that should NOT be here:

## Expected Result

A conceptual distribution of epic responsibilities aligned with the repository architecture rules.