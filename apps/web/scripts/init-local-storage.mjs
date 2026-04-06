#!/usr/bin/env node

import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000";
const region = process.env.S3_REGION ?? "eu-central-1";
const bucket = process.env.S3_BUCKET ?? "hege-assets";
const accessKeyId = process.env.S3_ACCESS_KEY ?? "minioadmin";
const secretAccessKey = process.env.S3_SECRET_KEY ?? "minioadmin";

const client = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

if (await bucketExists(bucket)) {
  console.log(`Storage bucket "${bucket}" already exists.`);
  process.exit(0);
}

await client.send(
  new CreateBucketCommand({
    Bucket: bucket
  })
);

console.log(`Storage bucket "${bucket}" created.`);

async function bucketExists(targetBucket) {
  try {
    await client.send(
      new HeadBucketCommand({
        Bucket: targetBucket
      })
    );

    return true;
  } catch (error) {
    const status =
      typeof error === "object" && error && "$metadata" in error ? error.$metadata?.httpStatusCode : undefined;
    const name = typeof error === "object" && error && "name" in error ? String(error.name) : undefined;

    if (status === 404 || name === "NotFound" || name === "NoSuchBucket") {
      return false;
    }

    throw error;
  }
}
