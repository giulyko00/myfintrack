# MyFinTrack Sample Data

This directory contains fixture files with sample data that can be loaded into your database for testing or demonstration purposes.

## Available Fixtures

- `users/fixtures/demo_user.json`: Contains a demo user account
- `transactions/fixtures/demo_transactions.json`: Contains sample transactions for the past 6 months

## Loading Fixtures

### In Development

To load the fixtures in your development environment, run the following commands:

```bash
# Load the demo user
python manage.py loaddata users/fixtures/demo_user.json

# Load the sample transactions
python manage.py loaddata transactions/fixtures/demo_transactions.json
```

### In Production

When deploying to production, you can load the fixtures with the same commands after you've set up your database:

```bash
python manage.py loaddata users/fixtures/demo_user.json
python manage.py loaddata transactions/fixtures/demo_transactions.json
```

## Demo User Credentials

The demo user has the following credentials:

- **Email:** demo@myfintrack.com
- **Password:** Password123

## Note on Sample Data

The sample data includes realistic financial transactions over the past 6 months including:
- Monthly salary income
- Regular expenses like rent and utilities
- Various other expenses across different categories
- Occasional additional income sources

This data will populate your charts and statistics, providing a good demonstration of the application's features.
