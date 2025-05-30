from rest_framework import serializers
from .models import Transaction, Budget, FinancialInsight
from datetime import date

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


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for the Budget model."""
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )
    period_display = serializers.CharField(
        source='get_period_display',
        read_only=True
    )
    # Calculate usage percentage for current month
    usage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_display',
            'amount',
            'period',
            'period_display',
            'usage_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('created_at', 'updated_at', 'usage_percentage')
    
    def get_usage_percentage(self, obj):
        """Get the current usage percentage of the budget."""
        today = date.today()
        return obj.get_usage_percentage(today.year, today.month)


class FinancialInsightSerializer(serializers.ModelSerializer):
    """Serializer for the FinancialInsight model."""
    insight_type_display = serializers.CharField(
        source='get_insight_type_display',
        read_only=True
    )
    # Include the data points as a dictionary
    data = serializers.ReadOnlyField()
    
    class Meta:
        model = FinancialInsight
        fields = [
            'id',
            'insight_type',
            'insight_type_display',
            'title',
            'content',
            'data',
            'is_read',
            'created_at',
        ]
        read_only_fields = ('created_at',)
