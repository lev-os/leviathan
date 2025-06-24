# WRITE Method - Git Repository Template

This repository provides a template structure for managing writing projects using the WRITE Method (Writing Refined with Integrated Team Environment).

## Overview

The WRITE Method is an agentic workflow inspired by the BMAD-METHOD for software development, adapted for writing projects like books, articles, newsletters, and more. It utilizes distinct AI agent roles, a structured file system, and a memory mechanism to manage the writing process from conception to publication.

## Roles

The workflow involves 10 distinct roles:

1.  **Content Strategist:** Defines project goals, audience, and overall strategy.
2.  **Developmental Editor:** Focuses on high-level structure, concept, and narrative.
3.  **Researcher:** Gathers information, evaluates sources, and builds outlines.
4.  **Writer:** Creates draft content based on research and outlines.
5.  **Fact Checker:** Verifies factual accuracy and logical consistency.
6.  **Editor:** Polishes content for clarity, style, grammar, and consistency.
7.  **Beta Reader/Review Team:** Provides feedback from the target audience perspective.
8.  **Visual Content Specialist:** Creates or sources supporting visuals.
9.  **Technical Consultant:** Provides subject matter expertise and verifies technical accuracy.
10. **Publication Specialist:** Formats final content for specific publication platforms.

System prompts for each role are available separately.

## Repository Structure

-   **/content-strategist/**: Stores strategy documents, briefs, etc.
-   **/developmental-editor/**: Stores developmental feedback reports.
-   **/researcher/**: Contains research notes, bibliographies, etc.
    -   `notes/`: Specific research findings.
-   **/writer/**: Contains draft versions of the content.
    -   `drafts/`: Working drafts.
-   **/fact-checker/**: Contains verification reports.
    -   `verification-reports/`: Fact-checking results.
-   **/editor/**: Contains edited drafts, style sheets, editing logs.
    -   `edited-drafts/`: Polished drafts.
-   **/beta-reader/**: Stores feedback from beta readers.
-   **/visual-content-specialist/**: Contains visual assets and logs.
    -   `assets/`: Image files, charts, etc.
-   **/technical-consultant/**: Stores technical review reports.
-   **/publication-specialist/**: Contains final, formatted packages for distribution.
    -   `final-packages/`: Publication-ready files (PDF, EPUB, etc.).
-   **/memory/**: Contains timestamped logs for each agent role, tracking actions and decisions (e.g., `YYYY-MM-DD_Researcher.md`).
-   **/table-of-contents/**: Contains the main outline or table of contents for the project (`toc.md`).
-   **/templates/**: Contains various template files used by the agents for structuring outputs.
    -   `book/`, `blog-series/`, `newsletter-series/`: Templates for specific long-form projects.
    -   `article.md`, `newsletter.md`, `tweet.md`: Templates for single pieces.
    -   Role-specific subdirectories (e.g., `researcher/`, `editor/`) contain templates for reports, logs, etc.

## Usage

1.  Use this repository as a template for your new writing project.
2.  Utilize AI agents (like those in VSCode or Cursor) configured with the WRITE Method role prompts.
3.  Follow the workflow, using the appropriate agent for each stage.
4.  Agents will read context from relevant directories (especially `/memory/` and `/table-of-contents/`) and save their outputs in their designated role directories, updating their memory log.
