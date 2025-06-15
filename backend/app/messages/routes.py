from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Message, User

messages_bp = Blueprint('messages', __name__)


# --- Маршруты для работы с сообщениями ---
# Здесь реализованы функции для получения, создания, просмотра и отметки сообщений как прочитанных
# Используется Flask Blueprint для организации маршрутов

@messages_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    current_user_id = get_jwt_identity()

    # Determine if we're getting inbox or sent messages
    folder = request.args.get('folder', 'inbox')

    if folder == 'inbox':
        messages = Message.query.filter_by(recipient_id=current_user_id)
    else:  # sent
        messages = Message.query.filter_by(sender_id=current_user_id)

    # Support searching by subject or sender/recipient
    search = request.args.get('search', '')
    if search:
        if folder == 'inbox':
            # Search in inbox - subject or sender username
            messages = messages.join(User, User.id == Message.sender_id).filter(
                (Message.subject.ilike(f'%{search}%')) |
                (User.username.ilike(f'%{search}%'))
            )
        else:
            # Search in sent - subject or recipient username
            messages = messages.join(User, User.id == Message.recipient_id).filter(
                (Message.subject.ilike(f'%{search}%')) |
                (User.username.ilike(f'%{search}%'))
            )

    # Sorting
    sort_by = request.args.get('sort_by', 'timestamp')
    sort_dir = request.args.get('sort_dir', 'desc')

    if sort_dir == 'desc':
        messages = messages.order_by(getattr(Message, sort_by).desc())
    else:
        messages = messages.order_by(getattr(Message, sort_by))

    messages = messages.all()
    return jsonify([msg.to_dict() for msg in messages]), 200


@messages_bp.route('/<int:message_id>', methods=['GET'])
@jwt_required()
def get_message(message_id):
    current_user_id = get_jwt_identity()

    message = Message.query.get_or_404(message_id)

    # Check permissions
    if message.recipient_id != current_user_id and message.sender_id != current_user_id:
        return jsonify({'error': 'Permission denied'}), 403

    # Mark as read if the current user is the recipient
    if message.recipient_id == current_user_id and not message.read:
        message.read = True
        db.session.commit()

    return jsonify(message.to_dict()), 200


@messages_bp.route('', methods=['POST'])
@jwt_required()
def create_message():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate input
    if not data or not data.get('recipient') or not data.get('subject') or not data.get('body'):
        return jsonify({'error': 'Missing required fields'}), 400

    # Find recipient
    recipient = User.query.filter_by(username=data['recipient']).first()
    if not recipient:
        return jsonify({'error': 'Recipient not found'}), 404

    # Create message
    message = Message(
        sender_id=current_user_id,
        recipient_id=recipient.id,
        subject=data['subject'],
        body=data['body']
    )

    db.session.add(message)
    db.session.commit()

    return jsonify({
        'message': 'Message sent successfully',
        'message_data': message.to_dict()
    }), 201


@messages_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(message_id):
    current_user_id = get_jwt_identity()

    message = Message.query.get_or_404(message_id)

    # Check permissions
    if message.recipient_id != current_user_id:
        return jsonify({'error': 'Permission denied'}), 403

    message.read = True
    db.session.commit()

    return jsonify({
        'message': 'Message marked as read',
        'message_data': message.to_dict()
    }), 200