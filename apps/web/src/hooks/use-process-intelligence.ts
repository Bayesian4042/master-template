"use client";

import { useMemo } from "react";
import { CMP_CASE_SERVICE_DATES, CMP_EVENTS } from "@/constants/templates/cmp";
import type { ProcessDefinition } from "@/types/operations.types";
import { reconcileProcess } from "@/utils/process-intelligence";

export function useProcessIntelligence(definition: ProcessDefinition) {
	return useMemo(
		() => reconcileProcess(definition, CMP_EVENTS, CMP_CASE_SERVICE_DATES),
		[definition],
	);
}
