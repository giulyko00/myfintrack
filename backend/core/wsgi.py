"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys
import subprocess
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize application
application = get_wsgi_application()

# Check if we're in production (on Render)
# Using a more reliable condition - check if DATABASE_URL is set, which is always true on Render
if os.environ.get('DATABASE_URL'):
    print("Detected production environment. Running migrations...")
    try:
        # Try to import directly from Django to avoid subprocess
        import django
        from django.core.management import call_command
        from django.db import connections
        
        # Try to connect to the database
        for _ in range(30):  # try for about 1 minute
            try:
                # Check if database is ready
                conn = connections['default'].cursor()
                conn.close()
                
                # Run migrations
                print("Applying migrations...")
                call_command('migrate', interactive=False)
                
                # Collect static
                print("Collecting static files...")
                call_command('collectstatic', interactive=False)
                
                print("Startup tasks completed successfully!")
                break
            except Exception as e:
                print(f"Database not ready yet: {e}")
                import time
                time.sleep(2)
    except Exception as e:
        print(f"Error during startup tasks: {e}")
        # Not blocking application startup even if migrations fail
