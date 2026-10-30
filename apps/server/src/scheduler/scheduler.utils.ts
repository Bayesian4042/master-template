const INTEGER_PATTERN = /^-?\d+$/;

/**
 * BullMQ rejects custom job ids that look like integers or contain ":".
 * Rewrite them deterministically so the same input keeps deduplicating.
 */
export const toSafeJobId = (jobId: string) => {
	const withoutColons = jobId.replace(/:/g, "-");
	return INTEGER_PATTERN.test(withoutColons)
		? `email-${withoutColons}`
		: withoutColons;
};
