## Today's task: Build the first Data → Process Intelligence pipeline

Goal: Upload real CMP data and automatically reconstruct the observed process using PM4JS.

Timebox: 3–4 hours.

### Input

Upload CMP Excel files:

- Menu Projection (MP)
- Menu Requisition (MR)
- Production Plan (PP)

### What to build

| Step            | Implementation                                         | Output                               |
| --------------- | ------------------------------------------------------ | ------------------------------------ |
| 1. Ingest       | Parse XLSX files                                       | Raw records                          |
| 2. Understand   | LLM identifies columns, timestamps, IDs and activities | Proposed schema mapping              |
| 3. Normalize    | User confirms mappings; NestJS constructs event logs   | `caseId, activity, timestamp, actor` |
| 4. Process mine | PM4JS discovers a directly-follows graph               | Actual process graph                 |
| 5. Analyze      | Calculate step frequencies and waiting times           | Top bottleneck + supporting cases    |

### Expected output

CMP Process Discovery

Illustrative

Menu Projection

Median wait: 18 hours

Menu Requisition

Median wait: 42 hours

Production Plan

Finding: MR → PP has the longest median waiting time.

Evidence: Show the exact cases and timestamps contributing to this calculation.

Actual results must be computed from uploaded records.

### Definition of done

- Upload an Excel file with unfamiliar column names.
- LLM proposes mappings; user can correct them.
- Backend reconstructs cases and timestamped events.
- PM4JS generates a process graph from those events.
- Display the longest waiting-time transition.
- Show the underlying records used to calculate it.

Critical: If the uploaded files lack activity timestamps or a reliable common case key, stop at the data-coverage report. Don't manufacture a process graph.

### My recommendation

Don't build recommendations, root-cause agents or sophisticated dashboards today.

Build this one vertical slice:

`Excel → LLM Mapping → Event Log → PM4JS → Process Graph → Bottleneck Evidence`

If it works with real CMP data, you've validated the most important technical foundation of Heizen Operations Intelligence.

### Heizen Operations Intelligence — High-Level Data Flow

\#chatgpt-mermaid-\_r_1cd\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1cd\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1cd\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1cd\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1cd\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1cd\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1cd\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1cd\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1cd\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1cd\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1cd\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1cd\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1cd\_ p{margin:0;}#chatgpt-mermaid-\_r_1cd\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1cd\_ .label text,#chatgpt-mermaid-\_r_1cd\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .node rect,#chatgpt-mermaid-\_r_1cd\_ .node circle,#chatgpt-mermaid-\_r_1cd\_ .node ellipse,#chatgpt-mermaid-\_r_1cd\_ .node polygon,#chatgpt-mermaid-\_r_1cd\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .rough-node .label text,#chatgpt-mermaid-\_r_1cd\_ .node .label text,#chatgpt-mermaid-\_r_1cd\_ .image-shape .label,#chatgpt-mermaid-\_r_1cd\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1cd\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .rough-node .label,#chatgpt-mermaid-\_r_1cd\_ .node .label,#chatgpt-mermaid-\_r_1cd\_ .image-shape .label,#chatgpt-mermaid-\_r_1cd\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1cd\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1cd\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1cd\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1cd\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_1cd\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1cd\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1cd\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1cd\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_1cd\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1cd\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1cd\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1cd\_ .icon-shape,#chatgpt-mermaid-\_r_1cd\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1cd\_ .icon-shape p,#chatgpt-mermaid-\_r_1cd\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_1cd\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1cd\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1cd\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1cd\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1cd\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1cd\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1cd\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1cd\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1cd\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1cd\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1cd\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1cd\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(65, 65, 65);}#chatgpt-mermaid-\_r_1cd\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(65, 65, 65);}#chatgpt-mermaid-\_r_1cd\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1cd\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1cd\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(252, 252, 252);stroke:rgb(219, 219, 219);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .node rect,#chatgpt-mermaid-\_r_1cd\_ .node circle,#chatgpt-mermaid-\_r_1cd\_ .node ellipse,#chatgpt-mermaid-\_r_1cd\_ .node polygon,#chatgpt-mermaid-\_r_1cd\_ .node path{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1cd\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1cd\_ .mermaid-decision .label-container{fill:rgb(249, 249, 249);stroke:rgb(219, 219, 219);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_1cd\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1cd\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1cd\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}User: Process explanation /TranscriptUser: Excel uploads (MP, MR,PP)LLM: Extract expectedprocess and rulesData ingestion + AI columnmappingNormalize and reconstructevent logsPM4JS: Process discoveryand analysisReconciliation + DriverAnalysisEvidence-backed FindingsLLM: Explanations andRecommendationsOperations Intelligence UI

### Key intermediate outputs

| Stage                 | Output                                                    |
| --------------------- | --------------------------------------------------------- |
| Process understanding | Expected steps, roles, deadlines and rules                |
| Data normalization    | `caseId, activity, timestamp, actor, sourceRecord`        |
| Process mining        | Actual process graph, variants, waiting times             |
| Reconciliation        | Deviations, bottlenecks and candidate drivers             |
| AI Intelligence       | Explanations, recommended actions and supporting evidence |

Important: LLMs understand and explain; PM4JS analyzes recorded process behavior; deterministic code calculates metrics.

The final UI should show:

1. Expected vs. Observed Process
2. Where and why performance differs
3. What operational changes to investigate
4. Evidence from actual records

If uploaded data lacks the necessary event timestamps, the system reports the missing evidence instead of inventing a process.
