import json
import os
from django.db import migrations
from django.conf import settings


def load_demo_transactions(apps, schema_editor):
    # Import the Transaction model directly from the migration
    Transaction = apps.get_model('transactions', 'Transaction')
    User = apps.get_model('users', 'User')
    
    # Check if we have any transactions already
    if Transaction.objects.count() > 0:
        print("Transactions already exist, skipping demo data import")
        return
    
    # Check if we have a demo user
    try:
        demo_user = User.objects.get(email='demo@myfintrack.com')
    except User.DoesNotExist:
        print("Demo user not found, cannot load transactions")
        return
    
    # Define the transaction data for all 30 transactions
    transactions_data = [
        {
            "model": "transactions.transaction",
            "pk": 1,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2024-12-05",
                "created_at": "2024-12-05T09:00:00Z",
                "updated_at": "2024-12-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 2,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2024-12-10",
                "created_at": "2024-12-10T14:30:00Z",
                "updated_at": "2024-12-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 3,
            "fields": {
                "user": demo_user.id,
                "amount": "280.00",
                "transaction_type": "EX",
                "category": "FOOD",
                "description": "Grocery shopping",
                "date": "2024-12-12",
                "created_at": "2024-12-12T18:45:00Z",
                "updated_at": "2024-12-12T18:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 4,
            "fields": {
                "user": demo_user.id,
                "amount": "120.00",
                "transaction_type": "EX",
                "category": "TRANSPORT",
                "description": "Gas for car",
                "date": "2024-12-15",
                "created_at": "2024-12-15T11:20:00Z",
                "updated_at": "2024-12-15T11:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 5,
            "fields": {
                "user": demo_user.id,
                "amount": "75.00",
                "transaction_type": "EX",
                "category": "ENTERTAIN",
                "description": "Movie night with friends",
                "date": "2024-12-20",
                "created_at": "2024-12-20T20:15:00Z",
                "updated_at": "2024-12-20T20:15:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 6,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2025-01-05",
                "created_at": "2025-01-05T09:00:00Z",
                "updated_at": "2025-01-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 7,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2025-01-10",
                "created_at": "2025-01-10T14:30:00Z",
                "updated_at": "2025-01-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 8,
            "fields": {
                "user": demo_user.id,
                "amount": "200.00",
                "transaction_type": "EX",
                "category": "UTILITIES",
                "description": "Electricity bill",
                "date": "2025-01-12",
                "created_at": "2025-01-12T10:45:00Z",
                "updated_at": "2025-01-12T10:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 9,
            "fields": {
                "user": demo_user.id,
                "amount": "150.00",
                "transaction_type": "EX",
                "category": "HEALTH",
                "description": "Pharmacy",
                "date": "2025-01-18",
                "created_at": "2025-01-18T16:20:00Z",
                "updated_at": "2025-01-18T16:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 10,
            "fields": {
                "user": demo_user.id,
                "amount": "250.00",
                "transaction_type": "EX",
                "category": "SHOPPING",
                "description": "New clothes",
                "date": "2025-01-25",
                "created_at": "2025-01-25T13:10:00Z",
                "updated_at": "2025-01-25T13:10:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 11,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2025-02-05",
                "created_at": "2025-02-05T09:00:00Z",
                "updated_at": "2025-02-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 12,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2025-02-10",
                "created_at": "2025-02-10T14:30:00Z",
                "updated_at": "2025-02-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 13,
            "fields": {
                "user": demo_user.id,
                "amount": "350.00",
                "transaction_type": "EX",
                "category": "FOOD",
                "description": "Monthly grocery shopping",
                "date": "2025-02-14",
                "created_at": "2025-02-14T18:45:00Z",
                "updated_at": "2025-02-14T18:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 14,
            "fields": {
                "user": demo_user.id,
                "amount": "500.00",
                "transaction_type": "IN",
                "category": "FREELANCE",
                "description": "Website design project",
                "date": "2025-02-18",
                "created_at": "2025-02-18T11:20:00Z",
                "updated_at": "2025-02-18T11:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 15,
            "fields": {
                "user": demo_user.id,
                "amount": "180.00",
                "transaction_type": "EX",
                "category": "ENTERTAIN",
                "description": "Concert tickets",
                "date": "2025-02-22",
                "created_at": "2025-02-22T20:15:00Z",
                "updated_at": "2025-02-22T20:15:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 16,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2025-03-05",
                "created_at": "2025-03-05T09:00:00Z",
                "updated_at": "2025-03-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 17,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2025-03-10",
                "created_at": "2025-03-10T14:30:00Z",
                "updated_at": "2025-03-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 18,
            "fields": {
                "user": demo_user.id,
                "amount": "130.00",
                "transaction_type": "EX",
                "category": "UTILITIES",
                "description": "Internet bill",
                "date": "2025-03-12",
                "created_at": "2025-03-12T10:45:00Z",
                "updated_at": "2025-03-12T10:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 19,
            "fields": {
                "user": demo_user.id,
                "amount": "300.00",
                "transaction_type": "EX",
                "category": "EDUCATION",
                "description": "Online course",
                "date": "2025-03-18",
                "created_at": "2025-03-18T16:20:00Z",
                "updated_at": "2025-03-18T16:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 20,
            "fields": {
                "user": demo_user.id,
                "amount": "600.00",
                "transaction_type": "EX",
                "category": "TRAVEL",
                "description": "Weekend trip",
                "date": "2025-03-25",
                "created_at": "2025-03-25T13:10:00Z",
                "updated_at": "2025-03-25T13:10:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 21,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2025-04-05",
                "created_at": "2025-04-05T09:00:00Z",
                "updated_at": "2025-04-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 22,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2025-04-10",
                "created_at": "2025-04-10T14:30:00Z",
                "updated_at": "2025-04-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 23,
            "fields": {
                "user": demo_user.id,
                "amount": "200.00",
                "transaction_type": "EX",
                "category": "TRANSPORT",
                "description": "Car maintenance",
                "date": "2025-04-14",
                "created_at": "2025-04-14T18:45:00Z",
                "updated_at": "2025-04-14T18:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 24,
            "fields": {
                "user": demo_user.id,
                "amount": "400.00",
                "transaction_type": "IN",
                "category": "INVESTMENT",
                "description": "Dividend payment",
                "date": "2025-04-18",
                "created_at": "2025-04-18T11:20:00Z",
                "updated_at": "2025-04-18T11:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 25,
            "fields": {
                "user": demo_user.id,
                "amount": "250.00",
                "transaction_type": "EX",
                "category": "SHOPPING",
                "description": "Electronics purchase",
                "date": "2025-04-22",
                "created_at": "2025-04-22T20:15:00Z",
                "updated_at": "2025-04-22T20:15:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 26,
            "fields": {
                "user": demo_user.id,
                "amount": "3500.00",
                "transaction_type": "IN",
                "category": "SALARY",
                "description": "Monthly salary",
                "date": "2025-05-05",
                "created_at": "2025-05-05T09:00:00Z",
                "updated_at": "2025-05-05T09:00:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 27,
            "fields": {
                "user": demo_user.id,
                "amount": "950.00",
                "transaction_type": "EX",
                "category": "HOUSING",
                "description": "Rent payment",
                "date": "2025-05-10",
                "created_at": "2025-05-10T14:30:00Z",
                "updated_at": "2025-05-10T14:30:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 28,
            "fields": {
                "user": demo_user.id,
                "amount": "300.00",
                "transaction_type": "EX",
                "category": "FOOD",
                "description": "Grocery shopping",
                "date": "2025-05-14",
                "created_at": "2025-05-14T18:45:00Z",
                "updated_at": "2025-05-14T18:45:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 29,
            "fields": {
                "user": demo_user.id,
                "amount": "150.00",
                "transaction_type": "EX",
                "category": "HEALTH",
                "description": "Doctor appointment",
                "date": "2025-05-18",
                "created_at": "2025-05-18T11:20:00Z",
                "updated_at": "2025-05-18T11:20:00Z"
            }
        },
        {
            "model": "transactions.transaction",
            "pk": 30,
            "fields": {
                "user": demo_user.id,
                "amount": "120.00",
                "transaction_type": "EX",
                "category": "ENTERTAIN",
                "description": "Dinner with friends",
                "date": "2025-05-22",
                "created_at": "2025-05-22T20:15:00Z",
                "updated_at": "2025-05-22T20:15:00Z"
            }
        }
    ]
    
    # Create each transaction
    for transaction_data in transactions_data:
        fields = transaction_data['fields']
        Transaction.objects.create(
            id=transaction_data['pk'],
            user_id=fields['user'],
            amount=fields['amount'],
            transaction_type=fields['transaction_type'],
            category=fields['category'],
            description=fields['description'],
            date=fields['date'],
            created_at=fields['created_at'],
            updated_at=fields['updated_at']
        )
    
    print(f"Created {len(transactions_data)} demo transactions")


def reverse_load_demo_transactions(apps, schema_editor):
    # Remove the demo transactions if the migration is reversed
    Transaction = apps.get_model('transactions', 'Transaction')
    # Get transactions for the demo user
    User = apps.get_model('users', 'User')
    try:
        demo_user = User.objects.get(email='demo@myfintrack.com')
        Transaction.objects.filter(user_id=demo_user.id).delete()
        print("Demo transactions removed")
    except User.DoesNotExist:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0001_initial'),
        ('users', '0002_create_demo_user'),  # Make sure demo user exists first
    ]

    operations = [
        migrations.RunPython(load_demo_transactions, reverse_load_demo_transactions),
    ]
