import { useEffect, useRef, useState } from "react";
import { uploadChunks } from "@douglas_farias/chunkupload/dist/main";
import "./App.css";

interface StateModel {
	chunks: Array<Blob>;
	recorder?: MediaRecorder;
	recording?: boolean;
	loading?: boolean;
}

const api = "https://localhost:7089/api/upload";

function App() {
	const video = useRef<HTMLVideoElement>(null);

	const [state, setState] = useState<StateModel>({
		chunks: [],
	});

	useEffect(createLivePreview, []);

	useEffect(() => {
		if (canUpload) createPreview();
	}, [state.chunks]);

	function getSupportedMimeType() {
		let supportedMimeType;
		if (MediaRecorder.isTypeSupported("video/webm")) supportedMimeType = "video/webm";
		else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1"))
			supportedMimeType = "video/mp4;codecs=avc1";

		return supportedMimeType;
	}

	function handleRecorderOnDataAvailable(event: BlobEvent) {
		if (event.data)
			setState((prevState) => ({ ...prevState, chunks: [...prevState.chunks, event.data] }));
	}

	function handleRecorderOnStart() {
		setState((prevState) => ({ ...prevState, recording: true }));
		console.log("Recorder started");
	}

	function handleRecorderOnStop() {
		setState((prevState) => ({ ...prevState, recording: false }));
		console.log("Recorder stopped");
	}

	async function createRecorder() {
		const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
		const mimeType = getSupportedMimeType();
		const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
		mediaRecorder.ondataavailable = handleRecorderOnDataAvailable;
		mediaRecorder.onstart = handleRecorderOnStart;
		mediaRecorder.onstop = handleRecorderOnStop;

		return mediaRecorder;
	}

	function createLivePreview() {
		navigator.mediaDevices.getUserMedia({ video: true }).then(async (mediaStream) => {
			if (video?.current) {
				video.current.pause();
				video.current.src = "";
				video.current!.srcObject = mediaStream;
				await video.current.play();
			}
		});
	}

	async function startRecording() {
		const recorder = await createRecorder();
		recorder.start(60000);

		setState((prevState) => ({ ...prevState, chunks: [], recorder }));
	}

	async function createPreview() {
		video!.current!.pause();
		video!.current!.srcObject = null;
		video!.current!.src = URL.createObjectURL(
			new File(state.chunks, "video.webm", { type: state.recorder?.mimeType })
		);
		await video!.current!.play();
	}

	async function stopRecording() {
		state.recorder?.stop();
	}

	async function uploadVideo() {
		setState((prevState) => ({ ...prevState, loading: true }));

		await uploadChunks(
			"https://localhost:7089/api/upload",
			state.chunks,
			"interview",
			state.recorder?.mimeType!
		);

		setState((prevState) => ({ ...prevState, loading: false }));
	}

	const canUpload = !state.recording && state.chunks.length > 0;

	return (
		<div className={"container"}>
			<div className={"card"}>
				<div className={"card-content"}>
					<video id="video" ref={video} controls={canUpload} loop />
				</div>
			</div>
			<hr />
			<div>
				<div className={"field"}>
					<input
						type={"button"}
						className={"button"}
						value={"Start Recording"}
						disabled={state.recording}
						onClick={startRecording}
					/>
				</div>
				<div className={"field"}>
					<input
						type={"button"}
						className={"button"}
						value={"Stop Recording"}
						disabled={!state.recording}
						onClick={stopRecording}
					/>
				</div>
				<div className={"field"}>
					<input
						type={"button"}
						className={"button"}
						value={"Upload Video"}
						disabled={!canUpload && !state.loading}
						onClick={uploadVideo}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
