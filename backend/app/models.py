from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
import datetime


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'admin', 'manager', or 'user'
    created_at = db.Column(db.DateTime, default=func.now())
    theme = db.Column(db.String(10), default='light')  # 'light' or 'dark'

    # Relationships
    documents = db.relationship('Document', backref='author', lazy='dynamic')
    messages_sent = db.relationship('Message',
                                    foreign_keys='Message.sender_id',
                                    backref='sender', lazy='dynamic')
    messages_received = db.relationship('Message',
                                        foreign_keys='Message.recipient_id',
                                        backref='recipient', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'theme': self.theme
        }


class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Document type
    file_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='draft')  # 'draft', 'pending', 'approved', 'rejected', etc.
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    signed = db.Column(db.Boolean, default=False)
    signature_date = db.Column(db.DateTime, nullable=True)
    content = db.Column(db.Text, nullable=True)  # Store document content for preview
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    history = db.relationship('DocumentHistory', backref='document', lazy='dynamic')
    approver = db.relationship('User', foreign_keys=[approver_id])

    def to_dict(self):
        approver_name = self.approver.username if self.approver else None
        return {
            'id': self.id,
            'title': self.title,
            'type': self.type,
            'file_path': self.file_path,
            'status': self.status,
            'author_id': self.author_id,
            'author': self.author.username,
            'approver_id': self.approver_id,
            'approver': approver_name,
            'signed': self.signed,
            'signature_date': self.signature_date.isoformat() if self.signature_date else None,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class DocumentHistory(db.Model):
    __tablename__ = 'document_history'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 'created', 'updated', 'approved', etc.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=func.now())
    reason = db.Column(db.Text, nullable=True)  # Optional reason for rejection

    # Relationship
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'action': self.action,
            'user_id': self.user_id,
            'user': self.user.username,
            'timestamp': self.timestamp.isoformat(),
            'reason': self.reason
        }


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=func.now())
    read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender': self.sender.username,
            'recipient_id': self.recipient_id,
            'recipient': self.recipient.username,
            'subject': self.subject,
            'body': self.body,
            'timestamp': self.timestamp.isoformat(),
            'read': self.read
        }