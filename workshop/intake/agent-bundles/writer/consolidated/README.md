# WRITE Method Consolidated Prompts

## Overview

This directory contains consolidated prompts for the WRITE Method (Writing Refined with Integrated Team Environment), a structured workflow for writing projects that leverages AI personas in distinct roles to create comprehensive, high-quality content.

Each consolidated prompt combines the best elements from the original prompts (`/prompts/`) and custom modes (`/ai/custom-modes/`) to create self-contained, comprehensive instructions for each role in the WRITE Method workflow.

## Prompt Structure

Each consolidated prompt follows a consistent structure:

1. **Role**: Clear definition of the role's purpose and expertise
2. **Goal**: Specific objectives for the role
3. **Task**: Concise summary of the primary task
4. **Instructions**: Detailed step-by-step guidance
5. **Templates**: Full templates embedded directly in the prompt
6. **Output Requirements**: Specific expectations for deliverables and handoff

## Key Improvements in Consolidated Prompts

1. **Self-containment**: All necessary information, including full templates, is embedded directly in each prompt, eliminating dependencies on external files
2. **Standardized structure**: Consistent format across all roles for easier comprehension and implementation
3. **Enhanced clarity**: Clearer, more detailed instructions with refined workflows
4. **Adaptive role selection**: Dynamic handoff logic to select the most appropriate next role based on project state
5. **Memory management**: Improved consistency in how memory logs are created and referenced

## Roles in the WRITE Method

The consolidated prompts cover the following roles, executed sequentially in most projects:

1. **Content Strategist**: Defines overall content direction, target audience, goals, and strategy
2. **Developmental Editor**: Focuses on high-level structure, concept, and narrative development
3. **Researcher**: Conducts in-depth research based on project requirements
4. **Writer**: Creates compelling content based on research and outlines
5. **Fact Checker**: Verifies factual accuracy, logical consistency, source attribution, and bias
6. **Editor**: Performs comprehensive editing focused on clarity, style, grammar, and consistency
7. **Beta Reader**: Provides feedback from the target audience perspective
8. **Visual Content Specialist**: Creates, sources, or curates visual elements to support the content
9. **Technical Consultant**: Provides specialized subject matter expertise to verify technical accuracy
10. **Publication Specialist**: Prepares final content for publication across specific formats

## Usage

To implement the WRITE Method workflow:

1. Begin with the Content Strategist role for new projects
2. Follow the dynamic handoff recommendations at the end of each role's output
3. Continue through the workflow until the Publication Specialist completes the project

The system is designed to be flexible, allowing you to skip certain roles or revisit them as needed based on project requirements.

## Project Directory Structure

The WRITE Method assumes a specific project directory structure with dedicated folders for each role's outputs and a shared memory system. This structure should be created at the beginning of a new project, typically by the Researcher role.

See the template in the Researcher prompt for the complete directory structure.
