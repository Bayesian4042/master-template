import "pm4js";

type Pm4jsAttribute = {
	value: unknown;
	attributes: unknown[];
};

type Pm4jsEvent = {
	attributes: Record<string, Pm4jsAttribute>;
};

type Pm4jsTrace = {
	attributes: Record<string, Pm4jsAttribute>;
	events: Pm4jsEvent[];
};

type Pm4jsEventLog = {
	traces: Pm4jsTrace[];
};

type Pm4jsFrequencyDfg = {
	activities: Record<string, number>;
	pathsFrequency: Record<string, number>;
};

type Pm4jsRuntime = {
	Attribute: new (value: unknown) => Pm4jsAttribute;
	Event: new () => Pm4jsEvent;
	Trace: new () => Pm4jsTrace;
	EventLog: new () => Pm4jsEventLog;
	FrequencyDfgDiscovery: {
		apply: (eventLog: Pm4jsEventLog, activityKey?: string) => Pm4jsFrequencyDfg;
	};
};

export const pm4js = globalThis as unknown as Pm4jsRuntime;
