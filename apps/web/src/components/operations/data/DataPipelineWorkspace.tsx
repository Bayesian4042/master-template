"use client";

import AlertMessage from "@repo/ui/general/AlertMessage";
import { useState } from "react";
import { useAnalyzeProcess, useProfileDatasets } from "@/queries";
import type {
	AnalyzeResponse,
	DatasetProfile,
} from "@/types/process-mining.types";
import type { MappingFormValues } from "@/validations/process-mining.validation";
import { BottleneckFindingView } from "./BottleneckFinding.view";
import { CoverageReportView } from "./CoverageReport.view";
import { DatasetUpload } from "./DatasetUpload";
import { MappingForm } from "./MappingForm";
import { ObservedProcessGraph } from "./ObservedProcessGraph";

type Step = "upload" | "map" | "result";

export function DataPipelineWorkspace() {
	const [step, setStep] = useState<Step>("upload");
	const [files, setFiles] = useState<File[]>([]);
	const [profiles, setProfiles] = useState<DatasetProfile[]>([]);
	const [result, setResult] = useState<AnalyzeResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const profileMutation = useProfileDatasets();
	const analyzeMutation = useAnalyzeProcess();

	function handleProfile(selected: File[]) {
		setError(null);
		setFiles(selected);
		profileMutation.mutate(selected, {
			onSuccess: (response) => {
				setProfiles(response.profiles);
				setStep("map");
			},
			onError: (err) => setError(err.message),
		});
	}

	function handleAnalyze(values: MappingFormValues) {
		setError(null);
		analyzeMutation.mutate(
			{ files, mappings: values.mappings },
			{
				onSuccess: (response) => {
					setResult(response);
					setStep("result");
				},
				onError: (err) => setError(err.message),
			},
		);
	}

	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			{error && (
				<div className="px-5 pt-4">
					<AlertMessage message={error} variant="destructive" />
				</div>
			)}

			{step === "upload" && (
				<DatasetUpload
					isLoading={profileMutation.isPending}
					onSubmit={handleProfile}
				/>
			)}

			{step === "map" && (
				<MappingForm
					profiles={profiles}
					isLoading={analyzeMutation.isPending}
					onBack={() => setStep("upload")}
					onSubmit={handleAnalyze}
				/>
			)}

			{step === "result" && result && (
				<div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h1 className="text-lg font-medium tracking-tight">
								CMP Process Discovery
							</h1>
							<p className="text-muted-foreground mt-1 text-sm">
								Observed process reconstructed from uploaded records.
							</p>
						</div>
						<button
							type="button"
							className="text-muted-foreground text-sm hover:text-foreground"
							onClick={() => {
								setStep("upload");
								setResult(null);
								setProfiles([]);
								setFiles([]);
							}}
						>
							Start over
						</button>
					</div>

					<CoverageReportView
						coverage={result.coverage}
						missing={result.missing}
					/>

					{result.status === "ok" && result.graph && (
						<>
							<section className="space-y-2">
								<p className="text-sm font-medium">Observed process</p>
								<ObservedProcessGraph
									graph={result.graph}
									bottleneck={result.bottleneck}
								/>
							</section>
							{result.bottleneck && (
								<BottleneckFindingView finding={result.bottleneck} />
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}
