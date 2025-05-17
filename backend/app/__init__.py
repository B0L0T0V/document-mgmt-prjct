from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=None):
    app = Flask(__name__, static_folder='../static')

    # Load the default configuration
    if config_class:
        app.config.from_object(config_class)
    else:
        # Use absolute import instead of relative import
        from config import Config
        app.config.from_object(Config)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Ensure uploads directory exists
    os.makedirs(os.path.join(app.static_folder, 'uploads'), exist_ok=True)

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.documents.routes import documents_bp
    from app.messages.routes import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')

    return app