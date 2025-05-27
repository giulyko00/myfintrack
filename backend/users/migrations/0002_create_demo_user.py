from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_demo_user(apps, schema_editor):
    # Import the User model directly from the migration
    User = apps.get_model('users', 'User')
    
    # Check if the demo user already exists
    if not User.objects.filter(email='demo@myfintrack.com').exists():
        # Create the demo user
        User.objects.create(
            email='demo@myfintrack.com',
            first_name='Demo',
            last_name='User',
            password=make_password('Password123'),  # Encrypt the password
            is_active=True,
            is_staff=True,  # Optional: give staff permissions
            is_superuser=True  # Optional: give superuser permissions
        )
        print("Demo user created successfully!")


def reverse_create_demo_user(apps, schema_editor):
    # Remove the demo user if the migration is reversed
    User = apps.get_model('users', 'User')
    User.objects.filter(email='demo@myfintrack.com').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_demo_user, reverse_create_demo_user),
    ]
