---
name: fsd-layer-responsibility-validator
description: Validates that the responsibility distribution follows the Feature Slice Design architecture rules.
---

# FSD Layer Responsibility Validator

## Objective

Validate that the conceptual responsibility distribution follows the Feature Slice Design architecture defined for the repository.

This skill validates the output produced by the architecture planning step.

## Input

Conceptual responsibility distribution from previous step.

Architecture rules defined in:

rules/repo-architecture-rule.md

## Rules to follow

You MUST follow:

rules/repo-architecture-rule.md

All validations must be based on these rules.

## Required Validation

Validate:

- Business rules must live in **entities**
- Functional flows must live in **features**
- Widgets must NOT contain domain logic
- Shared must NOT contain business knowledge
- Pages must only handle routing and composition

## Detect

Identify:

- Layer violations
- Responsibility misplacements
- Ambiguous ownership
- Possible architecture anti-patterns

## Constraints

- Do NOT redesign the architecture
- Do NOT propose refactors
- Do NOT invent new modules
- Only validate the responsibility distribution
- Base conclusions only on FSD rules

## Output Format

## Architecture Validation

### Correct Distribution

List responsibilities correctly assigned to their layers.

### Possible Violations

List responsibilities that appear to violate FSD rules and explain why.

### Ambiguities to Review

List responsibilities that could belong to multiple layers and require clarification.

## Expected Result

A validation report identifying whether the conceptual architecture respects the defined FSD layer rules and highlighting potential issues.