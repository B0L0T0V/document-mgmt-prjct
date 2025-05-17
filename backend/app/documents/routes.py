import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from app.models import db, Document, DocumentHistory, User
from datetime import datetime

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'doc', 'docx', 'pdf', 'txt', 'xlsx', 'xls', 'ppt', 'pptx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@documents_bp.route('', methods=['GET'])
@jwt_required()
def get_documents():
    current_user_id = get_jwt_identity()
    query = Document.query

    # Filter by type if specified
    document_type = request.args.get('type')
    if document_type:
        query = query.filter_by(type=document_type)

    # Filter by status if specified
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    # Filter by performer (author) if specified
    performer = request.args.get('performer')
    if performer:
        user = User.query.filter_by(username=performer).first()
        if user:
            query = query.filter_by(author_id=user.id)

    # Non-admin users can only see their own documents
    claims = get_jwt()
    if claims.get('role') != 'admin':
        query = query.filter_by(author_id=current_user_id)

    # Sort if specified
    sort_by = request.args.get('sort_by', 'created_at')
    sort_dir = request.args.get('sort_dir', 'desc')

    if sort_dir == 'desc':
        query = query.order_by(getattr(Document, sort_by).desc())
    else:
        query = query.order_by(getattr(Document, sort_by))

    documents = query.all()
    return jsonify([doc.to_dict() for doc in documents]), 200


@documents_bp.route('/<int:document_id>', methods=['GET'])
@jwt_required()
def get_document(document_id):
    document = Document.query.get_or_404(document_id)

    # Check permissions
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if document.author_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    return jsonify(document.to_dict()), 200


@documents_bp.route('', methods=['POST'])
@jwt_required()
def create_document():
    current_user_id = get_jwt_identity()

    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    # If user does not select file, browser also submits an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file or not allowed_file(file.filename):
        return jsonify({'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    # Create upload directory if it doesn't exist
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    # Get form data
    title = request.form.get('title')
    document_type = request.form.get('type', 'general')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    # Save the file
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    # Create document record
    document = Document(
        title=title,
        type=document_type,
        file_path=unique_filename,
        author_id=current_user_id,
        status='draft'
    )

    db.session.add(document)
    db.session.flush()  # Get the document ID

    # Add document history
    history = DocumentHistory(
        document_id=document.id,
        action='created',
        user_id=current_user_id
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({
        'message': 'Document created successfully',
        'document': document.to_dict()
    }), 201


@documents_bp.route('/<int:document_id>', methods=['PUT'])
@jwt_required()
def update_document(document_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    document = Document.query.get_or_404(document_id)

    # Check permissions
    if document.author_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    # Get form data
    data = request.form.to_dict()

    # Update document fields
    if 'title' in data:
        document.title = data['title']

    if 'type' in data:
        document.type = data['type']

    if 'status' in data:
        document.status = data['status']

    # Handle file update if provided
    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']

        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

        # Save the new file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        unique_filename = f"{timestamp}_{filename}"

        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)

        # Delete old file if it exists
        if document.file_path:
            old_file_path = os.path.join(upload_folder, document.file_path)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

        document.file_path = unique_filename

    # Add document history
    history = DocumentHistory(
        document_id=document.id,
        action='updated',
        user_id=current_user_id,
        reason=data.get('reason')
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({
        'message': 'Document updated successfully',
        'document': document.to_dict()
    }), 200


@documents_bp.route('/<int:document_id>/status', methods=['PUT'])
@jwt_required()
def update_document_status(document_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only admins can change document status
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    document = Document.query.get_or_404(document_id)
    data = request.get_json()

    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400

    document.status = data['status']

    # Add document history
    history = DocumentHistory(
        document_id=document.id,
        action=f'status_changed_to_{data["status"]}',
        user_id=current_user_id,
        reason=data.get('reason')
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({
        'message': 'Document status updated successfully',
        'document': document.to_dict()
    }), 200


@documents_bp.route('/<int:document_id>/file', methods=['GET'])
@jwt_required()
def get_document_file(document_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    document = Document.query.get_or_404(document_id)

    # Check permissions
    if document.author_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, document.file_path)


@documents_bp.route('/<int:document_id>/history', methods=['GET'])
@jwt_required()
def get_document_history(document_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    document = Document.query.get_or_404(document_id)

    # Check permissions
    if document.author_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    history = document.history.order_by(DocumentHistory.timestamp.desc()).all()
    return jsonify([h.to_dict() for h in history]), 200