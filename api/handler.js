import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as generateSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({});

export const getPresignedUrl = async (event) => {
  try {
    const bucket = "jkg7thtaywe";
    const key = uuidv4();
    const expireSeconds = 60 * 15;

    // Use PutObjectCommand with getSignedUrl
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "application/json",
    });

    const url = await generateSignedUrl(s3, command, { expiresIn: expireSeconds });
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Helper function to convert the stream
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};


export const executePayload = async (event) => { 
  try {
    const s3Event = event.Records[0].s3;
    const params = {
      Bucket: s3Event.bucket.name,
      Key: s3Event.object.key,
    };

    // Use GetObjectCommand to retrieve the object from S3
    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    
    // Read the data from the stream
    const result = await streamToString(data.Body);
    console.log(JSON.parse(result));  // Log the parsed JSON object
    
    /* Execute your business logic here. */
  } catch (err) {
    console.error("Error executing payload:", err);
    throw new Error(err);
  }
};



