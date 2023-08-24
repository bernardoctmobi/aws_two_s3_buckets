import { S3Client, GetObjectCommand, SelectObjectContentCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler = async (event) => {
    const uploadInfo = event.Records[0].s3;
    console.log(uploadInfo);

    // const params = {
    //     "Bucket": uploadInfo.bucket.name,
    //     "Key": uploadInfo.object.key
    // };
    const params = {
        Bucket: uploadInfo.bucket.name,
        Key: uploadInfo.object.key,
        Expression: "SELECT Nome FROM S3Object",
        ExpressionType: "SQL",
        InputSerialization: {
            CSV: {
                FileHeaderInfo: 'USE',
            },
            CompressionType: 'NONE',
        },
        OutputSerialization: {
            CSV: {
                RecordDelimiter: '\n',
                FieldDelimiter: ','
            }
        }
    };
    console.log(params);
    let dataChunks = [];
    const textDecoder = new TextDecoder();

    // const command = new GetObjectCommand(params);
    // const response = await client.send(command);
    // const stream = response.Body;
    // let fileContent = '';
    // stream.on('data', (chunk) => {
    //     fileContent += chunk.toString('utf-8');
    // });
    // stream.on('end', () => {
    //     console.log("File content: ", fileContent);
    // });

    try {
        const command = new SelectObjectContentCommand(params);
        const response = await client.send(command);
        console.log(response);

        for await (const eventChunk of response.Payload) {
            if (eventChunk.Records) {
                const chunkData = textDecoder.decode(eventChunk.Records.Payload);
                dataChunks.push(chunkData);
            }
        }
        const selectedNames = dataChunks.join("");
        console.log(selectedNames);
    } catch (error) {
        console.error("Error: ", error);
    }
    
    return true;
}