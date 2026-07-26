# Cache Spend Ledger

Append-only. One row per run; cumulative spend is carried from the row above.
Never edit or delete a past row — this is the audit trail of real dollars spent.

| timestamp (UTC) | run | hits | misses | input tok | output tok | run $ | cumulative $ |
|---|---|---:|---:|---:|---:|---:|---:|
| 2026-07-26T16:03:33.885Z | e2e-check | 0 | 1 | 42 | 51 | $0.0015 | $0.0015 |
| 2026-07-26T16:03:38.858Z | e2e-check | 1 | 0 | 0 | 0 | $0.0000 | $0.0015 |
| 2026-07-26T16:22:28.423Z | smoke-4scn | 0 | 7 | 10923 | 4214 | $0.1600 | $0.1615 |
| 2026-07-26T17:15:40.888Z | smoke-4scn | 6 | 4 | 6335 | 4517 | $0.1446 | $0.3061 |
| 2026-07-26T17:52:57.929Z | component-eval-13scn | 0 | 128 | 151251 | 26761 | $1.4253 | $1.7314 |
| 2026-07-26T17:53:18.658Z | pipeline-v1-prepass | 109 | 0 | 0 | 0 | $0.0000 | $1.7314 |
