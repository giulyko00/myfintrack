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
        """Get monthly summary of income and expenses based on selected time range."""
        # Get time range from query parameters with default of 6 months
        time_range = request.query_params.get('time_range', '6months')
        
        # Calculate date range based on time_range parameter
        today = timezone.now().date()
        current_year = today.year
        current_month = today.month
        
        # Define start date based on time range
        if time_range == '3months':
            months_to_include = 3
            if current_month >= months_to_include:
                start_date = today.replace(month=current_month - months_to_include + 1, day=1)
                start_year = current_year
            else:
                # Handle case where time range spans previous year
                months_from_prev_year = months_to_include - current_month
                start_month = 12 - months_from_prev_year + 1
                start_date = today.replace(year=current_year - 1, month=start_month, day=1)
                start_year = current_year - 1
        elif time_range == '6months':
            months_to_include = 6
            if current_month >= months_to_include:
                start_date = today.replace(month=current_month - months_to_include + 1, day=1)
                start_year = current_year
            else:
                # Handle case where time range spans previous year
                months_from_prev_year = months_to_include - current_month
                start_month = 12 - months_from_prev_year + 1
                start_date = today.replace(year=current_year - 1, month=start_month, day=1)
                start_year = current_year - 1
        elif time_range == '1year':
            start_date = today.replace(year=current_year - 1, month=current_month, day=1)
            start_year = current_year - 1
        else:  # 'all' or any other value
            # Get the date of the first transaction for this user
            first_transaction = Transaction.objects.filter(user=request.user).order_by('date').first()
            if first_transaction:
                start_date = first_transaction.date.replace(day=1)
                start_year = start_date.year
            else:
                # If no transactions, default to beginning of current year
                start_date = today.replace(month=1, day=1)
                start_year = current_year
        
        # Get all relevant months between start_date and today
        monthly_summaries = []
        
        # Calculate total number of months to loop through
        total_months = (current_year - start_year) * 12 + current_month - start_date.month + 1
        
        for i in range(total_months):
            # Calculate year and month for current iteration
            target_month = ((start_date.month - 1 + i) % 12) + 1
            target_year = start_year + (start_date.month - 1 + i) // 12
            
            # Only include months up to current date
            if target_year > current_year or (target_year == current_year and target_month > current_month):
                break
                
            # Get data for this month
            monthly_data = Transaction.objects.filter(
                user=request.user,
                date__year=target_year,
                date__month=target_month
            ).aggregate(
                income=Sum('amount', filter=Q(transaction_type='IN')),
                expenses=Sum('amount', filter=Q(transaction_type='EX'))
            )
            
            monthly_summaries.append({
                'month': target_month,
                'year': target_year,
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


    @action(detail=False, methods=['get'])
    def category_summary(self, request):
        """Get summary of expenses by category based on selected time range."""
        # Get time range from query parameters with default of 6 months
        time_range = request.query_params.get('time_range', '6months')
        
        # Calculate date range based on time_range parameter
        today = timezone.now().date()
        
        # Define date range based on time range
        if time_range == '3months':
            start_date = today - timedelta(days=90)
        elif time_range == '6months':
            start_date = today - timedelta(days=180)
        elif time_range == '1year':
            start_date = today - timedelta(days=365)
        else:  # 'all' or any other value
            start_date = None
        
        # Create base queryset
        queryset = Transaction.objects.filter(user=request.user, transaction_type='EX')
        
        # Apply date filter if applicable
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        # Get category-wise expenses
        category_expenses = queryset.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        # Transform to include category display names
        category_dict = dict(Transaction.Category.choices)
        for item in category_expenses:
            item['category'] = category_dict.get(item['category'], item['category'])
            item['total'] = abs(item['total'])
        
        return Response(category_expenses)


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
