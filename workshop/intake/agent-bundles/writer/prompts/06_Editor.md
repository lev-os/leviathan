### [TASK]

Perform comprehensive editing on the draft content, focusing on clarity, style, grammar, consistency, flow, and overall polish, preparing it for review or publication.

### [INSTRUCTIONS]

1.  **Gather Materials:** Collect the latest draft from `/writer/drafts/`, the fact-checker report from `/fact-checker/verification-reports/`, the style guide, the content strategy brief (`/content-strategist/`), developmental editor feedback (`/developmental-editor/`), and relevant memory logs (`/memory/`).
2.  **Review Context:** Understand the project goals, target audience, intended style, and any specific feedback already provided.
3.  **Perform Structural Edit (If Needed):** Review the overall organization and flow. Make adjustments to paragraph or section order if necessary to improve logic and readability. Update `/table-of-contents/toc.md` if structure changes significantly.
4.  **Perform Stylistic Edit:** Enhance clarity, conciseness, and sentence structure. Ensure the language is engaging and appropriate for the audience. Maintain consistent tone and voice.
5.  **Perform Copy Edit:** Correct errors in grammar, punctuation, spelling, syntax, and usage. Ensure adherence to the specified style guide (e.g., Chicago, AP).
6.  **Check Consistency:** Verify consistency in terminology, formatting, capitalization, numbers, and references throughout the document.
7.  **Mark Up or Edit Directly:** Either mark up the draft with suggested changes or edit the text directly, depending on the agreed workflow. If editing directly, consider using track changes or creating a new version.
8.  **Structure Output:** If providing feedback or a summary, use a template from `/templates/editor/` (e.g., `editing_log_template.md`, `style_sheet_template.md`).
9.  **Save Output:** Save the edited draft (e.g., `/editor/edited-drafts/chapter_3_edited_v1.md`) and any accompanying editing logs or style sheets in the `/editor/` directory.
10. **Update Memory:** Append a log entry to `/memory/YYYY-MM-DD_Editor.md` summarizing the editing performed (type: structural, stylistic, copy), key changes made, and files created/updated. Create the file if it doesn't exist, using the current date.

### [TEMPLATE]

Refer to and use templates located in `/templates/editor/` for editing logs (`editing_log_template.md`) or style sheets (`style_sheet_template.md`). Adhere strictly to the project's primary style guide for the text itself.

### [OUTPUT]

-   Create/update the edited draft file in `/editor/edited-drafts/`.
-   Potentially create editing logs or style sheets in `/editor/`.
-   Potentially update `/table-of-contents/toc.md`.
-   Append a summary log to `/memory/YYYY-MM-DD_Editor.md`.
-   Provide the handoff marker and recommendations:
    >>>HANDOFF TO [Role Needed Next]>>>

    **Recommended Next Roles:**
    1.  **Writer:** If significant revisions are required based on the edits.
    2.  **Beta Reader/Review Team:** To get audience feedback on the polished draft.
    3.  **Publication Specialist:** If the draft is considered final and ready for formatting/distribution.
    4.  **Fact Checker:** If edits introduced new claims needing verification.
