"use client";

import { Input } from "@repo/ui/components/input";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { useRef, useState } from "react";

export function DatasetUpload({
	isLoading,
	onSubmit,
}: {
	isLoading: boolean;
	onSubmit: (files: File[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>([]);

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-8">
			<div>
				<h1 className="text-lg font-medium tracking-tight">Connect CMP data</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Upload Menu Projection, Menu Requisition, and Production Plan Excel
					files. Column names can be unfamiliar — we will propose mappings.
				</p>
			</div>
			<Input
				ref={inputRef}
				type="file"
				accept=".xlsx,.xls"
				multiple
				onChange={(event) => {
					setFiles(Array.from(event.target.files ?? []).slice(0, 3));
				}}
			/>
			{files.length > 0 && (
				<ul className="text-muted-foreground space-y-1 text-sm">
					{files.map((file) => (
						<li key={file.name}>{file.name}</li>
					))}
				</ul>
			)}
			<LoadingButton
				type="button"
				isLoading={isLoading}
				disabled={files.length === 0}
				onClick={() => onSubmit(files)}
			>
				Profile files
			</LoadingButton>
		</div>
	);
}
