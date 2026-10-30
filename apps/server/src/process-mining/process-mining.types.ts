export type CellValue = string | number | boolean | Date | null;

export type ParsedRow = {
	rowNumber: number;
	values: Record<string, CellValue>;
};

export type ParsedSheet = {
	fileName: string;
	sheetName: string;
	headers: string[];
	rows: ParsedRow[];
};

export type ActivityMapping = {
	name: string;
	timestampColumn: string;
};

export type DatasetMapping = {
	fileName: string;
	caseKeyColumns: string[];
	activities: ActivityMapping[];
	actorColumn?: string;
};

export type DatasetProfile = {
	fileName: string;
	sheetName: string;
	rowCount: number;
	headers: string[];
	sampleRows: Record<string, CellValue>[];
	suggestedMapping: DatasetMapping;
};

export type ProfileResponse = {
	profiles: DatasetProfile[];
};

export type SourceEventRef = {
	timestamp: string;
	fileName: string;
	rowNumbers: number[];
	actor?: string;
};

export type CaseEvent = {
	caseId: string;
	activity: string;
	occurredAt: Date;
	actor?: string;
	fileName: string;
	rowNumbers: number[];
};

export type FileCoverage = {
	fileName: string;
	rowCount: number;
	validCaseKeyCount: number;
	activities: {
		name: string;
		validTimestampCount: number;
		dateOnly: boolean;
	}[];
};

export type CoverageReport = {
	files: FileCoverage[];
	casesWithEvents: number;
	casesWithTwoOrMoreActivities: number;
};

export type ProcessGraphNode = {
	activity: string;
	frequency: number;
};

export type ProcessGraphEdge = {
	from: string;
	to: string;
	frequency: number;
	medianWaitHours: number | null;
};

export type ProcessGraph = {
	nodes: ProcessGraphNode[];
	edges: ProcessGraphEdge[];
};

export type BottleneckEvidence = {
	caseId: string;
	waitHours: number;
	fromEvent: SourceEventRef;
	toEvent: SourceEventRef;
};

export type BottleneckFinding = {
	from: string;
	to: string;
	medianWaitHours: number;
	caseCount: number;
	lowSample: boolean;
	evidence: BottleneckEvidence[];
};

export type AnalyzeResponse = {
	status: "ok" | "insufficient_evidence";
	missing: string[];
	coverage: CoverageReport;
	graph?: ProcessGraph;
	bottleneck?: BottleneckFinding;
};
