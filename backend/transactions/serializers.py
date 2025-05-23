from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for the Transaction model."""
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display',
        read_only=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'amount',
            'transaction_type',
            'transaction_type_display',
            'category',
            'category_display',
            'description',
            'date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('created_at', 'updated_at')

class TransactionCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating transactions."""
    class Meta:
        model = Transaction
        fields = [
            'amount',
            'transaction_type',
            'category',
            'description',
            'date',
        ]
    
    def validate(self, attrs):
        """Validate the transaction data."""
        # You can add custom validation here if needed
        return attrs
