#!/usr/bin/env python3
"""
Flask Application Runner
Run this file to start the assistive communication app
"""

import os
from app import app
from config import config

if __name__ == '__main__':
    # Get configuration from environment
    config_name = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config.get(config_name, config['default']))
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting {app.config.__class__.__name__} server...")
    print(f"Server running on http://{host}:{port}")
    print("Press CTRL+C to quit")
    
    app.run(
        host=host,
        port=port,
        debug=app.config.get('DEBUG', False)
    )