"""
File upload helpers — stores profile images as base64 data URIs in the DB.

No files are written to disk. The returned string is a full data URI:
  data:image/jpeg;base64,/9j/4AAQSkZJRg...
which can be used directly as an <img src> value.
"""
import base64
from flask import current_app


ALLOWED_MIME_TYPES = {
    'image/png', 'image/jpeg', 'image/jpg',
    'image/gif', 'image/webp',
}

MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename: str) -> bool:
    """Legacy helper — kept for backwards-compat. Checks extension."""
    allowed = current_app.config.get(
        'ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    )
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def save_profile_image(file_storage) -> str | None:
    """
    Convert an uploaded image to a base64 data URI and return it.
    Nothing is written to disk.

    Returns a string like:
        data:image/jpeg;base64,<base64-encoded-bytes>
    or None if no file was provided.

    Raises ValueError for invalid file type or file too large.
    """
    if not file_storage or file_storage.filename == '':
        return None

    # Validate MIME type
    mime = file_storage.mimetype or ''
    if mime not in ALLOWED_MIME_TYPES:
        # Fallback: check extension
        if not allowed_file(file_storage.filename):
            raise ValueError(
                'File type not allowed. Use PNG, JPG, JPEG, GIF, or WEBP.'
            )
        # Derive mime from extension
        ext = file_storage.filename.rsplit('.', 1)[1].lower()
        mime = f'image/{ext}' if ext != 'jpg' else 'image/jpeg'

    # Read bytes
    raw = file_storage.read()

    if len(raw) > MAX_SIZE_BYTES:
        raise ValueError('File too large. Maximum size is 10 MB.')

    if not raw:
        return None

    encoded = base64.b64encode(raw).decode('utf-8')
    return f'data:{mime};base64,{encoded}'
