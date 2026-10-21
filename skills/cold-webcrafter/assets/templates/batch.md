# Batch

Started {{DATE}}. Shared answers: mode {{MODE}}, stack {{STACK}}, host
{{HOST}}, site language {{SITE_LANGUAGE}}, email language {{EMAIL_LANGUAGE}}.
Estimate: {{PER_SITE_ESTIMATE}} × {{SITE_COUNT}} sites = {{TOTAL_ESTIMATE}}.

A new session reads this file first and continues with the first site that
isn't `done`, `failed` or `out of scope`. Sites run one after another, each
in its own fresh context and its own project folder.

Status: `queued` | `in progress` | `done` | `failed` | `out of scope`

| # | Site | Project folder | Status | Preview URL | Email draft | Tokens | Note |
|---|---|---|---|---|---|---|---|
