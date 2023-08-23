import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler = async (event) => {
    const uploadInfo = event.Records[0].s3;
    console.log(uploadInfo);

    const params = {
        Bucket: uploadInfo.bucket.name,
        Key: uploadInfo.object.key
    };
    console.log(params);

    const command = new GetObjectCommand(params);
    const response = await client.send(command);

    console.log(response);

    return response;
}