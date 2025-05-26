from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import Transaction
from .serializers import TransactionSerializer, TransactionCreateUpdateSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows transactions to be viewed or edited.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['transaction_type', 'category', 'date']
    ordering_fields = ['date', 'amount', 'created_at']
    search_fields = ['description', 'category']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """Return only the transactions for the current user."""
        return Transaction.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateUpdateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Set the user to the current user when creating a transaction."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of transactions for the current user."""
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # Calculate total income and expenses for the current month
        monthly_data = Transaction.objects.filter(
            user=request.user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(
            total_income=Sum('amount', filter=Q(transaction_type='IN')),
            total_expenses=Sum('amount', filter=Q(transaction_type='EX'))
        )
        
        # Calculate total balance
        total_balance = Transaction.objects.filter(
            user=request.user
        ).aggregate(
            balance=Sum('amount', filter=Q(transaction_type='IN')) - 
                   Sum('amount', filter=Q(transaction_type='EX'))
        )['balance'] or 0
        
        # Calculate category-wise expenses for the current month
        category_expenses = Transaction.objects.filter(
            user=request.user,
            transaction_type='EX',
            date__year=today.year,
            date__month=today.month
        ).values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response({
            'total_income': monthly_data['total_income'] or 0,
            'total_expenses': abs(monthly_data['total_expenses'] or 0),
            'balance': total_balance,
            'category_expenses': category_expenses
        })

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly summary of income and expenses for the current year."""
        current_year = timezone.now().year
        
        # Get monthly summaries for the current year
        monthly_summaries = []
        for month in range(1, 13):
            monthly_data = Transaction.objects.filter(
                user=request.user,
                date__year=current_year,
                date__month=month
            ).aggregate(
                income=Sum('amount', filter=Q(transaction_type='IN')),
                expenses=Sum('amount', filter=Q(transaction_type='EX'))
            )
            
            monthly_summaries.append({
                'month': month,
                'year': current_year,
                'income': monthly_data['income'] or 0,
                'expenses': abs(monthly_data['expenses'] or 0),
                'savings': (monthly_data['income'] or 0) + (monthly_data['expenses'] or 0)
            })
        
        return Response(monthly_summaries)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available transaction categories divided by type."""
        # Get all category choices from the model
        income_categories = []
        expense_categories = []
        
        for choice in Transaction.Category.choices:
            category_code = choice[0]
            category_name = choice[1]
            
            # Check if this is an income or expense category based on naming convention
            # This assumes income categories have specific identifiers like SALARY, FREELANCE, etc.
            if category_code in ['SALARY', 'FREELANCE', 'INVESTMENT', 'GIFT', 'OTHER_INC']:
                income_categories.append({
                    'value': category_code,
                    'label': category_name
                })
            else:
                expense_categories.append({
                    'value': category_code,
                    'label': category_name
                })
        
        return Response({
            'income': income_categories,
            'expense': expense_categories
        })


class CategoryAPIView(APIView):
    """API view to get all available categories."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all available transaction categories divided by type."""
        # Get all category choices from the model
        income_categories = []
        expense_categories = []
        
        for choice in Transaction.Category.choices:
            category_code = choice[0]
            category_name = choice[1]
            
            # Check if this is an income or expense category based on naming convention
            if category_code in ['SALARY', 'FREELANCE', 'INVESTMENT', 'GIFT', 'OTHER_INC']:
                income_categories.append({
                    'value': category_code,
                    'label': category_name
                })
            else:
                expense_categories.append({
                    'value': category_code,
                    'label': category_name
                })
        
        return Response({
            'income': income_categories,
            'expense': expense_categories
        })
