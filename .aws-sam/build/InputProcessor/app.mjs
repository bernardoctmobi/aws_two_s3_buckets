import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";

const client = new S3Client({});

export const handler = async (event) => {
    const uploadInfo = event.Records[0].s3;
    console.log(uploadInfo);

    const params = {
        "Bucket": uploadInfo.bucket.name,
        "Key": uploadInfo.object.key
    };
    console.log(params);

    const command = new GetObjectCommand(params);
    const response = await client.send(command);
    const stream = response.Body;
    let fileContent = '';
    stream.on('data', (chunk) => {
        fileContent += chunk.toString('utf-8');
    });
    stream.on('end', () => {
        console.log("File content: ", fileContent);
    });

    // const { response } = await client.send(command);
    // const responseBody = await streamToString(response);
    // console.log(responseBody);
    
    return true;
}

// const streamToString = (stream) => new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on("data", (chunk) => chunks.push(chunk));
//     stream.on("error", reject);
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
// })