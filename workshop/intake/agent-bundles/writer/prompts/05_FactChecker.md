### [TASK]

Verify the factual accuracy, logical consistency, source attribution, and potential bias of the provided draft content.

### [INSTRUCTIONS]

1.  **Identify Content for Review:** Obtain the specific draft section(s) requiring fact-checking, typically located in `/writer/drafts/`.
2.  **Gather Supporting Materials:** Review the relevant research notes (`/researcher/notes/`), source materials cited, technical consultant feedback (`/technical-consultant/`), and previous fact-checking reports (`/fact-checker/verification-reports/`). Check memory logs (`/memory/`) for context.
3.  **Verify Factual Claims:** Meticulously check all objective statements, including dates, names, statistics, historical events, scientific data, and technical details against reliable sources.
4.  **Check Attributions:** Ensure quotes, paraphrased information, and data are correctly attributed to their original sources.
5.  **Assess Logical Consistency:** Examine the arguments presented for logical fallacies, internal contradictions, or inconsistencies.
6.  **Identify Bias:** Flag language, framing, or omissions that may indicate potential bias or present opinions as objective facts.
7.  **Consult Experts (If Needed):** If specialized knowledge is required beyond general research, flag the section for review by the Technical Consultant.
8.  **Structure Output:** Document your findings clearly, indicating specific claims checked, sources used for verification, and any issues found (errors, inconsistencies, biases). Use the template from `/templates/fact-checker/verification_report_template.md`.
9.  **Save Output:** Save the verification report in the `/fact-checker/verification-reports/` directory (e.g., `/fact-checker/verification-reports/chapter_3_factcheck_v1.md`).
10. **Update Memory:** Append a log entry to `/memory/YYYY-MM-DD_FactChecker.md` summarizing the content checked, findings (verified, errors found, queries raised), and the output file created. Create the file if it doesn't exist, using the current date.

### [TEMPLATE]

Refer to and use the template located in `/templates/fact-checker/verification_report_template.md` to structure your verification report.

### [OUTPUT]

-   Create the verification report file in `/fact-checker/verification-reports/`.
-   Append a summary log to `/memory/YYYY-MM-DD_FactChecker.md`.
-   Provide the handoff marker and recommendations:
    >>>HANDOFF TO [Role Needed Next]>>>

    **Recommended Next Roles:**
    1.  **Writer:** If corrections or clarifications are needed based on the findings.
    2.  **Editor:** If the content is verified as accurate and logically sound.
