"""
Drishti-Path — S3 Client Wrapper
Handles file uploads and signed URL generation.
"""
import os
import boto3
from botocore.exceptions import ClientError
from app.config import get_settings

settings = get_settings()


class S3Client:
    """Wrapper around boto3 for S3-compatible storage."""

    def __init__(self):
        self._client = boto3.client(
            "s3",
            region_name=settings.S3_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
        )

    async def upload_file(self, file_data: bytes, key: str, content_type: str = "video/mp4") -> str:
        """Upload a file to S3 (or local disk in dev) and return the key."""
        if settings.APP_ENV == "local":
            import aiofiles
            local_path = os.path.join("storage_volume", key)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            async with aiofiles.open(local_path, "wb") as f:
                await f.write(file_data)
            return key

        try:
            self._client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=file_data,
                ContentType=content_type,
            )
            return key
        except ClientError as e:
            raise RuntimeError(f"S3 upload failed: {e}")

    def get_signed_url(self, key: str, expiry_seconds: int = 3600) -> str:
        """Generate a pre-signed URL for accessing a file. 1-hour expiry by default."""
        if settings.APP_ENV == "local":
            return f"http://localhost:8000/storage/{key}"

        try:
            return self._client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
                ExpiresIn=expiry_seconds,
            )
        except ClientError as e:
            raise RuntimeError(f"Signed URL generation failed: {e}")

    def delete_file(self, key: str) -> None:
        """Delete a file from S3."""
        try:
            self._client.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
            )
        except ClientError as e:
            raise RuntimeError(f"S3 delete failed: {e}")


# Singleton
_s3_client = None


def get_s3_client() -> S3Client:
    global _s3_client
    if _s3_client is None:
        _s3_client = S3Client()
    return _s3_client
