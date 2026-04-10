#!/usr/bin/env python3
import json
import os
from pathlib import Path

import boto3
import yaml
from botocore.config import Config
from dotenv import load_dotenv


ROOT = Path.cwd()
ENV_PATH = ROOT.parent / ".env"
SITE_CONFIG_PATH = ROOT / "site.config.yaml"
SITE_MANIFEST_PATH = ROOT / "content" / "site-image-manifest.json"

load_dotenv(ENV_PATH)

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

if not all([ACCOUNT_ID, ACCESS_KEY, SECRET_KEY]):
    raise SystemExit("Missing R2 credentials in root .env")

with open(SITE_CONFIG_PATH, "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)

with open(SITE_MANIFEST_PATH, "r", encoding="utf-8") as f:
    manifest = json.load(f)

site_dir = ROOT.name
bucket_name = f"{site_dir}-assets"

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4"),
)

allowed = set()
for slot in manifest.get("slots", []):
    output = slot.get("output", "")
    base = Path(output).name
    if not base:
        continue
    allowed.add(f"images/{base}.webp")
    allowed.add(f"images/{base}.png")

continuation_token = None
deleted = []

while True:
    kwargs = {"Bucket": bucket_name, "Prefix": "images/"}
    if continuation_token:
        kwargs["ContinuationToken"] = continuation_token
    response = s3.list_objects_v2(**kwargs)

    for item in response.get("Contents", []):
        key = item["Key"]
        if key in allowed:
            continue
        s3.delete_object(Bucket=bucket_name, Key=key)
        deleted.append(key)

    if not response.get("IsTruncated"):
        break
    continuation_token = response.get("NextContinuationToken")

print(f"Deleted {len(deleted)} remote image objects from bucket {bucket_name}.")
for key in deleted:
    print(f"- {key}")
