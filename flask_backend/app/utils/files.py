"""
File upload helpers — replaces Multer from the Node.js stack.
"""
import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename


def allowed_file(filename: str) -> bool:
    """Check if the file extension is in the allowed set."""
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def save_profile_image(file_storage) -> str | None:
    """
    Save an uploaded image file to the configured upload folder.

    Returns the relative filename (e.g. 'abc123.jpg') on success, or None.
    The caller stores this value in Influencer.profile_image_url.
    The file is served at /uploads/<filename>.
    """
    if not file_storage or file_storage.filename == '':
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError('File type not allowed. Use PNG, JPG, JPEG, GIF, or WEBP.')

    ext = file_storage.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    safe_name = secure_filename(unique_name)

    upload_dir = os.path.join(
        current_app.root_path, '..', current_app.config['UPLOAD_FOLDER']
    )
    os.makedirs(upload_dir, exist_ok=True)

    file_storage.save(os.path.join(upload_dir, safe_name))
    return safe_name
