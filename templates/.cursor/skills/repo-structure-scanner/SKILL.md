---
name: repo-structure-scanner
description: Scans the repository structure to identify architecture layers, modules and code organization.
---

# Repo Structure Scanner

## Objective

Analyze the real repository structure to understand how the codebase is currently organized.

## Analysis Scope

Analyze the folder structure under `src/`.

Identify:

- app
- pages
- features
- entities
- widgets
- shared

Detect:

- existing modules
- implemented features
- domain entities
- reusable widgets
- shared infrastructure

Also evaluate:

- presence of utils or helpers folders
- infrastructure folders
- relevant technical modules

## Constraints

- Do NOT infer functional behavior
- Do NOT assume business logic
- Only describe real technical structure
- Base conclusions only on existing files

## Related Rules

repo-architecture-rule.md

## Output Format

## Repository Structure

### app

### pages

### features

### entities

### widgets

### shared

### other relevant folders

## Expected Result

A structural analysis describing:

- Current architecture organization
- Module distribution
- Structural observations
- Possible inconsistencies