import fetchBuilder from "fetch-retry";

interface ContentRange {
	firstByte: number;
	lastByte: number;
	totalBytes: number;
}

function createContentRange(totalBytes: number) {
	return {
		firstByte: 0,
		lastByte: 0,
		totalBytes: totalBytes,
	} as ContentRange;
}

function getChunkName(prefix: string, contentRange: ContentRange) {
	return `${prefix}_${contentRange.firstByte}-${contentRange.lastByte}-${contentRange.totalBytes}.mp4`;
}

function createFormData(chunk: BlobPart, fileName: string, type: string) {
	let formData = new FormData();
	let file = new File([chunk], fileName, { type });
	formData.set("chunk", file);

	return formData;
}

async function uploadChunk(url: string, body: FormData, contentRange: ContentRange) {
	const doFetch = fetchBuilder(fetch);
	await doFetch(url, {
		method: "post",
		body,
		headers: {
			"Content-Range": `bytes ${contentRange.firstByte}-${contentRange.lastByte}/${contentRange.totalBytes}`,
		},
	});
}

export async function uploadChunks(
	url: string,
	chunks: Blob[],
	chunkNamePrefix: string,
	chunkMimeType: string
) {
	const contentRange = createContentRange(chunks.length);
	for (const chunk in chunks) {
		contentRange.lastByte++;

		const chunkName = getChunkName(chunkNamePrefix, contentRange);
		const body = createFormData(chunk, chunkName, chunkMimeType);
		await uploadChunk(url, body, contentRange);

		contentRange.firstByte++;
	}
}
