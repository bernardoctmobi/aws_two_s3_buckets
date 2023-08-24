import {
    S3Client,
    GetObjectCommand,
    SelectObjectContentCommand,
    PutObjectCommand
} from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler = async (event) => {
    const uploadInfo = event.Records[0].s3;
    console.log(uploadInfo);
    const data = await retrieveData(uploadInfo.bucket.name, uploadInfo.object.key);
    console.log(data);
    const result = await uploadFilteredData(data, uploadInfo.object.key);
    return result;
}

async function retrieveData(bucket, key) {
    const params = {
        Bucket: bucket,
        Key: key,
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
    const textDecoder = new TextDecoder();
    let dataChunks = [];

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
        return selectedNames;
    } catch (error) {
        console.error("Error: ", error);
        return false;
    }
}

async function uploadFilteredData(dataString, key) {
    const buffer = Buffer.from(dataString, 'utf-8');
    const destinationBucket = 'sam-app-outputbucket-j9iazds0obxi'//fare variabile d'ambiente
    const newObjectKey = `filtered${key}`;
    const uploadParams = {
        Bucket: destinationBucket,
        Key: newObjectKey,
        Body: buffer
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        const response = await client.send(command);
        console.log("Selected data uploaded to output bucket");
        return response;
    } catch (error) {
        console.error("Error uploading data: ", error);
        return false;
    }
}