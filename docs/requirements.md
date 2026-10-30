### Heizen Operations Intelligence CMP MVP Technical Requirements

**Decision:** Build an upload-first Operations Intelligence MVP for Compass Food Service Central Menu Planning (CMP). The ingestion, process-model, event reconstruction, analysis, and evidence contracts must be generic; the first rule pack, sample data, and terminology are CMP-specific.

**Product promise:** A user describes the expected process and uploads operational records. Heizen reconstructs what can be observed, shows where execution differs, investigates recurring drivers, and proposes testable actions. Every finding links back to original evidence. This is an analysis product, not an autonomous decision maker.

**V1 success criterion:** With a previously unseen CMP dataset, an operations analyst can produce at least one defensible, nontrivial finding about process performance or recurring drivers, inspect the exact supporting records, and agree on an action to test.

# Scope and product boundaries

**Included in V1**

1. Create one CMP analysis workspace.

2. Ingest a pasted description or uploaded TXT/MD meeting transcript/SOP excerpt. Guided, multi-turn clarification and confirmation of extracted facts.

3. Upload one or more CSV/XLSX files; support variable headers and user-confirmed semantic mappings.

4. Reconstruct cases and timestamps from MP (Menu Projection), MR (Menu Requisition), and PP (Production Plan), subject to data availability.

5. Display expected process, observed process/case timelines, data-coverage limitations, rule deviations, bottlenecks, and recurring segment-level patterns.

6. Produce prioritized findings with counts, denominators, evidence references, candidate drivers, and a measurable recommended action.

7. Re-run the same saved configuration on replacement uploads; compare before/after metrics when periods and definitions are comparable.

**Excluded from V1**

- Direct ERP/CMP integrations, continuous real-time streaming, cross-company taxonomies, fully editable BPMN, automated process changes, predictive ML models, causal-effect claims, automatic invoice/waste savings calculations without source cost and actual-waste data, and KI/GI conformance when only MP/MR/PP are available.

- Live voice conversations; recorded audio transcription, PDF/DOCX extraction, KI/GI and automated scheduling are follow-on capabilities.

**Design rule:** Generic framework + CMP configuration. Avoid hardcoded CMP field names and analysis counts in platform services.

# User journey and required outputs

| Stage | User provides | System produces | User confirms |
| - | - | - | - |
| Describe | Pasted text or meeting transcript | Proposed steps, roles, sequence, rules, deadlines, open questions with evidence spans | Expected process draft |
| Map data | CSV/XLSX files, assigned dataset labels if known | File profile, suggested field mappings, timestamp/ID/unit checks, sample rows | Identity, time, activity, quantity mappings |
| Reconstruct | Confirmed model + mapped records | Canonical cases/events, expected vs observed timelines, process variants and coverage report | Ambiguous matches only |
| Investigate | Selected time period, site/meal filters | KPIs, gaps, bottlenecks, likely contributing conditions with cohort comparisons | Finding validity |
| Act | Selected finding | Evidence-backed explanation, candidate actions, KPI to monitor, owner/status | Action to test |

**Screen outputs:** (1) Discovery conversation + live expected process; (2) Data mapping and quality review; (3) Process exploration with cases/variants and evidence; (4) Intelligence briefing with findings, filters and an investigation drawer. Keep a compact analyst briefing and avoid large dead-space charts.

# CMP configuration and data feasibility

**Expected narrative scope:** Menu Planning → Menu Projection (MP) → Menu Requisition (MR) → Production Plan (PP) → Kitchen Indent (KI) → Goods Issue (GI). Only the MP/MR/PP portion is analyzable with initial files; other steps remain stated/unverified unless evidence is uploaded.

**Candidate operational case key:** siteId + serviceDate + mealType. This must be confirmed using actual files; a week-level or menu-level key may be required. Support configurable identity normalization and explicit unmatched records. Never force a join merely because row order or names look similar.

**Preferred input fields**

| Dataset | Core fields | Optional, unlocks richer analysis |
| - | - | - |
| MP | Site, service date/period, meal type, process-record ID | projected covers, created/submitted/approved timestamps, revision history, owner |
| MR | Site, service date/period, meal type, process-record ID | submitted timestamp, submitted role, approval timestamp, item, quantity, UOM, status history |
| PP | Site, service date/period, meal type, process-record ID | created/approved timestamp, planned covers or comparable units, revisions, actor, production status |

The UI should profile uploaded columns and infer mappings using a deterministic header dictionary plus LLM suggestions. It must show example values and confidence; the user confirms mappings before analysis.

**Analysis eligibility gates**

- No stable case identifier → no cross-file reconstructed process; show mapping failure and dataset-local profiling.

- No timestamp for a step → do not calculate its duration or ordering. A dated record is not automatically a timestamped activity event.

- No actor/role → do not infer wrong-role violations.

- No verified calendar rule → no late/on-time classification.

- No comparable quantities, UOM, or recipe conversion → do not compare covers to ingredient kilograms.

- No actual consumption or waste records → do not claim overproduction, food waste, or realized savings.

For each gate, show what is missing and which upload/field would unlock the analysis.

# Canonical domain contracts

```ts
type FactOrigin = 'stated' | 'observed' | 'inferred';
type EvidenceState = 'confirmed' | 'potential' | 'insufficient_evidence';

type ExpectedStep = {
  id: string; activity: string; order: number;
  expectedRole?: string; predecessors: string[];
  deadlineRule?: { offsetDays: number; localTime: string; timezone: string; dayType: 'calendar' | 'business' };
  provenance: { sourceId: string; quoteOrSpan: string; confirmedByUser: boolean };
};

type SourceRecordRef = {
  uploadId: string; sheetName?: string; rowNumber: number; originalRecordId?: string;
};

type CaseEvent = {
  id: string; caseId: string; activity: string;
  occurredAt: string; actor?: string; status?: string;
  source: SourceRecordRef;
};

type Finding = {
  id: string; runId: string; type: string; evidenceState: EvidenceState;
  title: string; affectedCases: number; eligibleCases: number;
  stepIds: string[]; evidenceRefs: SourceRecordRef[];
  observedFacts: string[]; contributingFactors: string[];
  possibleExplanations: string[]; recommendedActions: string[];
  limitations: string[];
};
```

**Model distinctions:** An uploaded row may be a snapshot, event, or item line. Store source rows independently. Only construct a CaseEvent if the row really records a meaningful activity and usable time; do not generate an event from every spreadsheet row. Preserve repeat events and versions when meaningful, while preventing item-line multiplication from inflating process-step counts.

**Required persisted entities:** Workspace, ProcessDefinitionVersion, ProcessSource, Rule, DatasetUpload, ColumnMappingVersion, SourceRecord, ProcessCase, CaseEvent, AnalysisRun, Finding, FindingEvidence, RecommendationAction. Derived tables can be materialized or computed depending on volume.

# MVP analysis engine

**A. Evidence and quality checks (run first)**

- Missing or malformed case keys and timestamps; timezone and date interpretation.

- Duplicate business IDs, ambiguous joins, unmapped actors, conflicting versions, missing source coverage.

- Per-dataset and cross-file case-match coverage. Distinguish missing records from proof that a step was skipped.

**B. Deterministic process conformance**

1. Late MR vs user-confirmed cutoff (including timezone and calendar/business-day definition).

2. Unexpected MR actor/role when the uploaded source supports that comparison.

3. Out-of-order MP/MR/PP, only where activity timestamps are available.

4. Missing expected evidence (not a confirmed skipped process step).

**C. Process performance and driver investigation**

1. Frequency of observed variants (e.g., MP → MR → PP vs revisions/rework when history exists).

2. Median and p90 wait between timestamped steps; compare sites and periods on the same case definition.

3. Segment deviations by site, weekday, meal, actor/role and revision count where available.

4. Rank candidate drivers by prevalence, difference from comparable peers, impact proxy and evidence coverage. Show baseline, group count and small-sample warnings; default to not asserting patterns for groups under 10 eligible cases.

5. Support user drill-down from a segment finding to individual cases and original file rows.

**D. Recommendations and business value**

- Templates map confirmed deviation types to possible interventions; LLM explains and adapts them with cited observations.

- Every recommendation has a proposed owner, change to test, target metric, guardrail metric and follow-up window.

- Quantify hours or money only when corresponding rates, costs, quantities and definitions are supplied. Other findings use time, count or adherence impact.

**Example CMP insight (hypothetical):** “MR → PP waits at sites A/B are 2.1× the peer median. Most long waits follow repeated MR revisions. Review the late-change policy at these sites.” Show case counts, timestamps, peer definition and source rows. Label repeated revisions as an associated factor—not a proven cause.

# Findings and explainability contract

Every finding must answer six questions in this order:

1. **What happened?** A measurable observation with period, denominator and filters.

2. **Compared with what?** Stated rule, peer baseline, or earlier period, clearly identified.

3. **Where is it happening?** Sites, meals, variants and affected cases.

4. **What evidence supports it?** Clickable file/sheet/row and ordered case timeline.

5. **What might explain it?** Candidate explanations, separately labeled as hypotheses.

6. **What should we test?** Specific intervention and measurable success/guardrail KPI.

**Severity:** Derived from spread, lateness/variance magnitude, outcome impact where available and evidence quality. Data gaps are not process violations; keep a separate quality queue.

**AI policy:** LLMs may extract/process-language facts and draft explanations, clarification questions and actions. LLMs must not compute final metrics, invent process events, infer missing timestamps, assert causal roots, fabricate financial value or silently modify confirmed business rules. All quantitative values come from deterministic functions or queries.

# Technical architecture

**Frontend:** Next.js App Router, shadcn/ui, React Flow with dagre layout for discovery and process exploration, existing Recharts/TanStack Table. Use scoped Heizen color #96b2c0. Reuse Discovery and Intelligence prototype components where sound; add explicit Upload/Mapping and Case Investigation flows.

**Backend:** NestJS, Prisma, PostgreSQL, BullMQ + Redis for asynchronous runs. Store original files in existing Azure Blob or S3-compatible object storage; store only references and parsed normalized rows in database. Parse XLSX/CSV with maintained Node libraries. Reuse existing LLM provider wrapper; use Zod/JSON schema validation for structured extraction.

**NestJS modules**

- ProcessSourcesModule: documents/transcripts, extraction jobs, provenance spans.

- ProcessDefinitionsModule: structured steps, rule versions, clarifications and confirmation.

- DatasetsModule: upload, preview, profiling, schema suggestions and mapping validation.

- CaseBuilderModule: normalization, case matching, event reconstruction and lineage.

- AnalysisModule: quality, conformance, variants, wait times, segment comparisons.

- FindingsModule: ranking, evidence assembly, hypothesis/action drafting, exports.

**Suggested API boundary**

| Endpoint | Result |
| - | - |
| POST /workspaces//process-sources | Create text/transcript source and start extraction |
| GET /process-drafts/ | Proposed steps, rules, ambiguity questions and source spans |
| PATCH /process-drafts/ | Confirm or correct expected process |
| POST /workspaces//datasets | Upload file and start profiling |
| GET /datasets//profile | Sheets, rows, header suggestions and coverage |
| PUT /datasets//mapping | Confirm mappings and transformations |
| POST /workspaces//analysis-runs | Snapshot versions; enqueue reconstruction and analysis |
| GET /analysis-runs/ | Status, coverage, KPIs and finding IDs |
| GET /findings/ | Evidence, impacted cases, hypotheses and actions |
| POST /findings//actions | Record an intervention and metric to monitor |

**Reproducibility:** Every AnalysisRun pins process-definition version, upload IDs, mapping versions, detector version, time window and configuration. Results should be stable for identical inputs. Use idempotent background jobs and row-level source lineage.

**No separate Python service for V1.** Begin with TypeScript/SQL detectors; add a dedicated mining library only when actual logs justify advanced discovery/conformance.

# Engineering milestones and acceptance tests

| Milestone | Build | Exit criteria |
| - | - | - |
| M0 — Data feasibility | Inspect 5–10 actual rows from MP/MR/PP; validate case keys, timestamps, joins and units | Signed-off data contract and feasible detector list |
| M1 — Process intake | Text/transcript extraction, multi-turn clarifications, editable expected steps/rules | Corrections persisted; every rule retains quoted source and confirmation |
| M2 — Generic file intake | CSV/XLSX profile, field mapping, previews, quality coverage | Unseen column names handled through mapping; failures actionable |
| M3 — Canonical reconstruction | Case matcher, normalized records, optional events, lineage | Matched/unmatched counts reproducible; no fabricated activities |
| M4 — Analytics | 4 conformance detectors, variants, wait-time stats, segment comparisons | Fixture tests pin exact counts, medians and eligible denominators |
| M5 — Intelligence UI | Findings ranking, stated vs observed, source rows, case timelines, actions | Analyst can independently verify each finding |
| M6 — Repeatability | Run snapshots, second upload and period comparison | Two equivalent inputs yield identical results; comparable periods show deltas |

**Required test fixtures**

- Normal MP → MR → PP, all dates valid.

- Late MR with correct timezone and cutoff; edge case exactly at deadline.

- No matching PP record: insufficient evidence, not “PP skipped.”

- MR item lines for one requisition: exactly one business activity unless versions justify repeats.

- A malformed date, missing role, ambiguous site alias and duplicate record.

- Mixed units: variance calculation disabled until conversion exists.

- A site cohort with fewer than 10 cases: driver comparison marked low sample.

- A repeated upload with the same files: no duplicated cases/results.

**Demo acceptance:** Use a seeded dataset with known injected process variants and problems, but show it as demo data. At least one full finding must be generated end-to-end from records—not hardcoded narrative or KPI constants. Inspect output in desktop browser at 1440px and 1024px.

# Business success criteria and product gates

**User value criteria**

- Can start without granting a system integration.

- Understands the expected process in under one guided session.

- Can map unfamiliar Excel columns without developer intervention.

- Can trace a finding to source records and understand why that finding was produced.

- Receives an explanation and recommended change that operations can accept or reject.

- Can compare results after a new upload to see whether the intervention improved an appropriate metric.

**Minimum success metrics:** percentage of uploaded records mapped, percentage of cases confidently matched, percentage of expected steps observable, findings with complete evidence, analyst acceptance/rejection rate of findings, and analysis time.

**Release gates:** Demonstrate on real CMP samples before claiming root-cause intelligence. If source records lack revision history, activity timestamps or actual outcomes, expose the limitation and focus on the analyses the records support.

**Post-MVP expansion path:** Audio/PDF/DOCX → KI/GI + actual consumption/waste → configurable process packs → richer event logs and variant mining → intervention tracking → connectors and scheduled runs. Generalize only interfaces/data contracts initially; keep the first production implementation CMP-focused.

**Immediate next action:** Obtain a small anonymized MP, MR and PP extract plus one real CMP process explanation/transcript. Validate the join key and timestamps; then lock M0 and begin M1–M4.