import React from "react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LOADING_STEPS = [
	"🔍 Starting query analysis...",
	"🌐 Searching the web...",
	"🔗 Collecting relevant URLs...",
	"🕸️ Scraping content...",
	"🧠 Analyzing content...",
	"✍️ Synthesizing response...",
];
const STEP_INTERVAL = 4000; // 3 seconds per step

export default function App() {
	const [query, setQuery] = useState("");
	const [responseContent, setResponseContent] = useState("");
	const [sources, setSources] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [currentStep, setCurrentStep] = useState(0);
	const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startLoadingSteps = () => {
		setCurrentStep(0);
		stepTimerRef.current = setInterval(() => {
			setCurrentStep((prev) => {
				if (prev + 1 === LOADING_STEPS.length - 1) {
					if (stepTimerRef.current !== null) {
						clearInterval(stepTimerRef.current);
					}
					stepTimerRef.current = null;
					return prev + 1;
				}
				return prev + 1;
			});
		}, STEP_INTERVAL);
	};

	const stopLoadingSteps = () => {
		if (stepTimerRef.current) {
			clearInterval(stepTimerRef.current);
			stepTimerRef.current = null;
		}
		setCurrentStep(0);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResponseContent("");
		setSources([]);
		startLoadingSteps();

		try {
			const res = await fetch(
				"https://web-research-agent-nd8o.onrender.com/execute-research",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ query }),
				},
			);
			if (!res.ok) throw new Error(`Server error: ${res.status}`);
			const data = await res.json();
			setResponseContent(data.result.content);
			setSources(data.result.sources);
		} catch (err: any) {
			setError(err.message);
		} finally {
			stopLoadingSteps();
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold text-center mb-6">
				🔍 Web Research Assistant
			</h1>

			<form onSubmit={handleSubmit} className="flex gap-2 mb-4">
				<input
					type="text"
					className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					placeholder="Enter your query..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
				>
					Search
				</button>
			</form>

			{loading && (
				<div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4" />
					<p className="text-blue-600 font-medium">
						{LOADING_STEPS[currentStep]}
					</p>
				</div>
			)}
			{error && <p className="text-red-600">{error}</p>}

			{!loading && responseContent && (
				<div className="bg-white shadow-md rounded-lg p-6">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={{
							div: ({ node, ...props }) => (
								<div className="prose max-w-none" {...props} />
							),
						}}
					>
						{responseContent}
					</ReactMarkdown>
					<div className="mt-6">
						<h2 className="text-lg font-semibold">Sources</h2>
						<ul className="list-disc list-inside mt-2 space-y-1">
							{sources.map((src) => (
								<li key={src}>
									<a
										href={src}
										className="text-blue-600 underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{src}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
