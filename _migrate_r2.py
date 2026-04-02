#!/usr/bin/env python3
"""
从 n8nhub 桶复制 bridal 产品图片到 bridaljewelleryset-assets 桶
"""
import os
import io
import boto3
from botocore.config import Config
from dotenv import load_dotenv

# 加载项目根 .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

SRC_BUCKET = "n8nhub"
DST_BUCKET = "bridaljewelleryset-assets"

# 要迁移的文件列表
FILES = [
    "products/jewelry-set-pearl-rhinestone/banner_1.webp",
    "products/jewelry-set-pearl-rhinestone/banner_2.webp",
    "products/jewelry-set-pearl-rhinestone/banner_3.webp",
    "products/jewelry-set-pearl-rhinestone/banner_4.webp",
    "products/jewelry-set-pearl-rhinestone/feature_1.webp",
    "products/jewelry-set-pearl-rhinestone/feature_2.webp",
    "products/jewelry-set-pearl-rhinestone/feature_3.webp",
    "products/jewelry-set-pearl-rhinestone/variant_metal-color_zt9248-brown.webp",
    "products/jewelry-set-pearl-rhinestone/variant_metal-color_zt9248-colour.webp",
    "products/jewelry-set-pearl-rhinestone/variant_metal-color_zt9248-golden.webp",
    "products/jewelry-set-pearl-rhinestone/variant_metal-color_zt9248-silvery.webp",
]

def main():
    s3 = boto3.client(
        's3',
        endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4")
    )
    
    success = 0
    fail = 0
    
    for key in FILES:
        try:
            # Download from source bucket
            print(f"⬇️  Downloading: {SRC_BUCKET}/{key}")
            response = s3.get_object(Bucket=SRC_BUCKET, Key=key)
            data = response['Body'].read()
            content_type = response.get('ContentType', 'image/webp')
            
            # Upload to destination bucket
            print(f"⬆️  Uploading:   {DST_BUCKET}/{key}")
            s3.put_object(
                Bucket=DST_BUCKET,
                Key=key,
                Body=data,
                ContentType=content_type
            )
            print(f"✅ Done: {key} ({len(data)} bytes)")
            success += 1
        except Exception as e:
            print(f"❌ Failed: {key} - {e}")
            fail += 1
    
    print(f"\n🎉 Migration complete: {success} success, {fail} failed")

if __name__ == "__main__":
    main()
