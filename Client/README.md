# ChunkUpload

## What is it?

ChunkUpload helps you to upload large files in chunks with control of the upload progress

## How it works?

When you call the `uploadChunks` function, we add the `Content-Range` header in the request and you can handle it in the client

## The ContentRange header

The header is somenting like this `bytes {firstByte}-{lastByte}/{totalBytes}`, firstByte is the last chunk sent, lastByte is the actual chunk, totalBytes is the array.lenght
