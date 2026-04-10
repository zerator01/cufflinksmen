#!/usr/bin/env python3
import os
import json
import mimetypes
from pathlib import Path

import boto3
import yaml
from botocore.config import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv


ROOT = Path.cwd()
ENV_PATH = ROOT.parent / ".env"
SITE_CONFIG_PATH = ROOT / "site.config.yaml"
IMAGES_DIR = ROOT / "public" / "images"
SITE_MANIFEST_PATH = ROOT / "content" / "site-image-manifest.json"
JSON_OUTPUT_PATH = ROOT / "content" / "site-image-upload-manifest.json"
MARKDOWN_OUTPUT_PATH = ROOT / "content" / "site-image-upload-manifest.md"

load_dotenv(ENV_PATH)

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

if not all([ACCOUNT_ID, ACCESS_KEY, SECRET_KEY]):
    raise SystemExit("Missing R2 credentials in root .env")

if not SITE_CONFIG_PATH.exists():
    raise SystemExit("Missing site.config.yaml")

if not IMAGES_DIR.exists():
    raise SystemExit("Missing public/images directory")

if not SITE_MANIFEST_PATH.exists():
    raise SystemExit("Missing content/site-image-manifest.json")


with open(SITE_CONFIG_PATH, "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)

site_dir = ROOT.name
brand_domain = config.get("brand", {}).get("domain", f"{site_dir}.com")
bucket_name = f"{site_dir}-assets"
public_domain = f"https://assets.{brand_domain}"

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4"),
)


def ensure_bucket():
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError:
        s3.create_bucket(Bucket=bucket_name)


def upload_file(file_path: Path):
    key = f"images/{file_path.name}"
    content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    with open(file_path, "rb") as f:
        s3.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=f,
            ContentType=content_type,
        )
    return {
        "file": file_path.name,
        "key": key,
        "url": f"{public_domain}/{key}",
        "content_type": content_type,
        "size_bytes": file_path.stat().st_size,
    }


def load_allowed_files():
    with open(SITE_MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    allowed = set()
    for slot in manifest.get("slots", []):
        output = slot.get("output", "")
        base = Path(output).name
        if not base:
            continue
        allowed.add(f"{base}.webp")
        allowed.add(f"{base}.png")
    return allowed


ensure_bucket()

uploaded = []
allowed_files = load_allowed_files()

for file_path in sorted(IMAGES_DIR.glob("*")):
    if file_path.suffix.lower() not in {".webp", ".png"}:
        continue
    if file_path.name not in allowed_files:
        continue
    uploaded.append(upload_file(file_path))

payload = {
    "site": site_dir,
    "bucket": bucket_name,
    "public_domain": public_domain,
    "uploaded_count": len(uploaded),
    "files": uploaded,
}

JSON_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
with open(JSON_OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
    f.write("\n")

markdown_lines = [
    "# Site Image Upload Manifest",
    "",
    f"- Site: `{site_dir}`",
    f"- Bucket: `{bucket_name}`",
    f"- Public domain: `{public_domain}`",
    f"- Uploaded count: {len(uploaded)}",
    "",
    "## Files",
    "",
    "| File | Key | URL | Size |",
    "| --- | --- | --- | --- |",
]

for item in uploaded:
    markdown_lines.append(
        f"| `{item['file']}` | `{item['key']}` | `{item['url']}` | {item['size_bytes']} |"
    )

with open(MARKDOWN_OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(markdown_lines) + "\n")

print(f"Uploaded {len(uploaded)} site images to bucket {bucket_name}.")
