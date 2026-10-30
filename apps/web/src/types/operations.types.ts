export type FactStatus = "confirmed" | "assumed" | "missing";

export type EvidenceState = "confirmed" | "potential" | "insufficient_evidence";

export type DeviationType =
	| "late"
	| "wrong_role"
	| "sequence"
	| "missing_step"
	| "quantity_variance"
	| "rework";

export type RuleKind = "deadline" | "role" | "sequence" | "quantityTolerance";

export type SourceDataset = "MP" | "MR" | "PP" | "KI" | "GI";

export type FindingSeverity = "critical" | "high" | "medium" | "low";

export type FindingKind =
	| "process_deviation"
	| "knowledge_gap"
	| "data_quality";

export type QuantityUnit = "kg" | "g" | "L" | "ml" | "ea" | "portion";

export type ConformanceRule =
	| {
			id: string;
			kind: "deadline";
			stepId: string;
			daysBeforeService: number;
			hour: number;
			minute: number;
			label: string;
			isDemoAssumption: boolean;
	  }
	| {
			id: string;
			kind: "role";
			stepId: string;
			expectedRole: string;
			label: string;
			isDemoAssumption: boolean;
	  }
	| {
			id: string;
			kind: "sequence";
			stepId: string;
			requiresStepId: string;
			label: string;
			isDemoAssumption: boolean;
	  }
	| {
			id: string;
			kind: "quantityTolerance";
			stepId: string;
			compareToStepId: string;
			field: string;
			tolerancePct: number;
			label: string;
			isDemoAssumption: boolean;
	  };

export type ProcessStep = {
	id: string;
	name: string;
	order: number;
	role: string;
	dependsOn: string[];
	dataset?: SourceDataset;
	deadlineLabel?: string;
	rules: string[];
	factStatus: FactStatus;
	isDemoAssumption: boolean;
	verifiableIn?: SourceDataset;
};

export type ProcessDefinition = {
	id: string;
	name: string;
	industryLabel: string;
	steps: ProcessStep[];
	rules: ConformanceRule[];
};

export type SourceRecord = {
	dataset: SourceDataset;
	rowId: string;
};

export type CaseEvent = {
	id: string;
	caseId: string;
	siteId: string;
	siteName: string;
	weekLabel: string;
	activityId: string;
	timestamp: string | null;
	actor: string | null;
	role: string | null;
	sourceRecord: SourceRecord;
	values: {
		quantity?: number;
		unit?: QuantityUnit;
		covers?: number;
		cost?: number;
	};
};

export type ObservedCase = {
	caseId: string;
	siteId: string;
	siteName: string;
	weekLabel: string;
	serviceDate: string;
	events: CaseEvent[];
};

export type Deviation = {
	id: string;
	type: DeviationType;
	evidenceState: EvidenceState;
	stepId: string;
	caseId: string;
	ruleId?: string;
	eventIds: string[];
	stated: string;
	observed: string;
	impactScore: number;
	costImpact?: number;
	delayHours?: number;
	variancePct?: number;
};

export type Finding = {
	id: string;
	title: string;
	kind: FindingKind;
	severity: FindingSeverity;
	evidenceState: EvidenceState;
	stepId: string;
	deviationType: DeviationType;
	stated: string;
	observed: string;
	whyItMatters: string;
	explanations: string[];
	actions: string[];
	affectedCaseIds: string[];
	evidenceEventIds: string[];
	deviationIds: string[];
	impactScore: number;
	costImpact?: number;
	percentageOfCases: number;
	denominator: number;
};

export type Kpi = {
	id: string;
	label: string;
	value: string;
	stated?: string;
	observed?: string;
	hint: string;
	tone: "neutral" | "good" | "warn" | "bad";
};

export type StepAdherence = {
	stepId: string;
	stepName: string;
	confirmedOk: number;
	confirmedDeviation: number;
	potential: number;
	insufficient: number;
	totalCases: number;
	adherencePct: number;
};

export type Bottleneck = {
	fromStepId: string;
	toStepId: string;
	label: string;
	medianHours: number;
};

export type DataQualityIssue = {
	id: string;
	severity: "warning" | "info";
	message: string;
	eventIds: string[];
	count: number;
};

export type IntelligenceResult = {
	cases: ObservedCase[];
	deviations: Deviation[];
	findings: Finding[];
	kpis: Kpi[];
	stepAdherence: StepAdherence[];
	bottlenecks: Bottleneck[];
	dataQuality: DataQualityIssue[];
	headline: {
		title: string;
		detail: string;
		action: string;
		kind: FindingKind;
		stated: string;
		observed: string;
		statedShort: string;
		observedShort: string;
		findingId: string;
		affectedCases: number;
		evidenceCount: number;
		casesAnalysed: number;
		eventsAnalysed: number;
		deviationSignals: number;
		knowledgeGapSignals: number;
		dataQualitySignals: number;
	};
};

export type ConversationEntryPoint = "describe" | "transcript" | "document";

export type ConversationMessage = {
	id: string;
	role: "assistant" | "user";
	content: string;
	kind?: "text" | "question" | "progress" | "cta";
	receipt?: string;
};

export type CapturedFact = {
	status: "confirmed" | "skipped";
	answer?: string;
};

export type ClarificationQuestion = {
	id: string;
	prompt: string;
	suggestions: string[];
	stepId?: string;
	ruleId?: string;
	field: "role" | "deadline" | "rule" | "dependency" | "name";
	revealsStepIds?: string[];
};

export type DiscoveryScriptTurn = {
	id: string;
	assistantMessages: string[];
	question?: ClarificationQuestion;
	applyAnswer?: (
		definition: ProcessDefinition,
		answer: string,
	) => ProcessDefinition;
	revealStepIds?: string[];
};

export type ProcessSessionState = {
	definition: ProcessDefinition;
	entryPoint: ConversationEntryPoint | null;
	messages: ConversationMessage[];
	turnIndex: number;
	isComplete: boolean;
	isThinking: boolean;
	selectedStepId: string | null;
	pendingQuestion: ClarificationQuestion | null;
	error: string | null;
	capturedFacts: Record<string, CapturedFact>;
	lastCapturedStepIds: string[];
	captureSeq: number;
	resolutionNote: string | null;
};
