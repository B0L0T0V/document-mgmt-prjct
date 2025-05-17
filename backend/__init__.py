from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, static_folder='../../frontend/build')

    # Load configuration
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.documents.routes import documents_bp
    from app.messages.routes import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')

    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    return app