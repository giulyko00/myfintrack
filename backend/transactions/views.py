from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q, Count, Avg, F, ExpressionWrapper, FloatField
from django.utils import timezone
from datetime import timedelta, date
from collections import defaultdict
import random

from .models import Transaction, Budget, FinancialInsight
from .serializers import (
    TransactionSerializer, TransactionCreateUpdateSerializer,
    BudgetSerializer, FinancialInsightSerializer
)


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

class BudgetViewSet(viewsets.ModelViewSet):
    """API endpoint that allows budgets to be viewed or edited."""
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'period']
    ordering_fields = ['category', 'amount', 'created_at']
    ordering = ['category']

    def get_queryset(self):
        """Return only the budgets for the current user."""
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user to the current user when creating a budget."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of all budgets with their usage percentages."""
        today = date.today()
        year = today.year
        month = today.month
        
        # Get all budgets for the current user
        budgets = self.get_queryset()
        
        # Calculate total budget and used amount
        monthly_budgets = budgets.filter(period=Budget.Period.MONTHLY)
        yearly_budgets = budgets.filter(period=Budget.Period.YEARLY)
        
        # Calculate total monthly budget
        total_monthly_budget = monthly_budgets.aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate total yearly budget (divided by 12 for monthly equivalent)
        total_yearly_budget = yearly_budgets.aggregate(total=Sum('amount'))['total'] or 0
        monthly_equivalent_yearly_budget = total_yearly_budget / 12 if total_yearly_budget > 0 else 0
        
        # Calculate total budget (monthly + yearly/12)
        total_budget = total_monthly_budget + monthly_equivalent_yearly_budget
        
        # Calculate total expenses for current month
        total_expenses = abs(Transaction.objects.filter(
            user=request.user,
            transaction_type=Transaction.TransactionType.EXPENSE,
            date__year=year,
            date__month=month
        ).aggregate(total=Sum('amount'))['total'] or 0)
        
        # Calculate overall budget usage
        overall_usage_percentage = min(100, int((total_expenses / total_budget) * 100)) if total_budget > 0 else 0
        
        # Get budget details with their usage
        budget_details = BudgetSerializer(budgets, many=True).data
        
        return Response({
            'total_budget': total_budget,
            'total_expenses': total_expenses,
            'remaining_budget': max(0, total_budget - total_expenses),
            'overall_usage_percentage': overall_usage_percentage,
            'budgets': budget_details
        })


class FinancialInsightViewSet(viewsets.ModelViewSet):
    """API endpoint that allows financial insights to be viewed or edited."""
    permission_classes = [IsAuthenticated]
    serializer_class = FinancialInsightSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['insight_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only the insights for the current user."""
        return FinancialInsight.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user to the current user when creating an insight."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark an insight as read."""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response({'status': 'insight marked as read'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate AI-powered financial insights based on user's transactions."""
        user = request.user
        
        # Get all transactions for the user
        transactions = Transaction.objects.filter(user=user)
        
        # If no transactions, return a message
        if not transactions.exists():
            return Response({
                'message': 'Not enough transaction data to generate insights.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate insights
        insights = self._generate_insights(user, transactions)
        
        # Return the generated insights
        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)
    
    def _generate_insights(self, user, transactions):
        """Generate financial insights based on user's transaction data."""
        insights = []
        today = timezone.now().date()
        
        # 1. Spending patterns analysis
        spending_pattern = self._analyze_spending_patterns(user, transactions)
        if spending_pattern:
            insights.append(spending_pattern)
        
        # 2. Budget alerts for categories exceeding 80% of budget
        budget_alerts = self._generate_budget_alerts(user)
        insights.extend(budget_alerts)
        
        # 3. Savings opportunities
        savings_opportunity = self._find_savings_opportunities(user, transactions)
        if savings_opportunity:
            insights.append(savings_opportunity)
        
        # 4. General financial advice
        general_advice = self._generate_general_advice(user, transactions)
        if general_advice:
            insights.append(general_advice)
        
        return insights
    
    def _analyze_spending_patterns(self, user, transactions):
        """Analyze spending patterns to find categories with significant spending."""
        today = timezone.now().date()
        start_date = today - timedelta(days=90)  # Last 3 months
        
        # Get expenses from the last 3 months
        recent_expenses = transactions.filter(
            transaction_type=Transaction.TransactionType.EXPENSE,
            date__gte=start_date
        )
        
        if not recent_expenses.exists():
            return None
        
        # Group expenses by category and calculate totals
        category_totals = defaultdict(float)
        for expense in recent_expenses:
            category_totals[expense.category] += abs(expense.amount)
        
        # Find the top spending category
        top_category = max(category_totals.items(), key=lambda x: x[1], default=(None, 0))
        
        if not top_category[0]:
            return None
        
        # Get the category display name
        category_display = dict(Transaction.Category.choices).get(top_category[0], top_category[0])
        
        # Calculate the percentage of total spending
        total_spending = sum(category_totals.values())
        percentage = int((top_category[1] / total_spending) * 100) if total_spending > 0 else 0
        
        # Create the insight
        insight = FinancialInsight(
            user=user,
            insight_type=FinancialInsight.InsightType.SPENDING_PATTERN,
            title=f"{percentage}% of your spending is on {category_display}",
            content=f"Over the past 3 months, you've spent ${top_category[1]:.2f} on {category_display}, "
                   f"which is {percentage}% of your total expenses. Consider if this aligns with your financial goals."
        )
        
        # Add data points
        insight.data = {
            'category': top_category[0],
            'category_display': category_display,
            'amount': float(top_category[1]),
            'percentage': percentage,
            'time_period': '3 months'
        }
        
        return insight
    
    def _generate_budget_alerts(self, user):
        """Generate alerts for categories exceeding budget thresholds."""
        alerts = []
        today = timezone.now().date()
        
        # Get all budgets for the user
        budgets = Budget.objects.filter(user=user)
        
        for budget in budgets:
            # Calculate usage percentage
            usage_percentage = budget.get_usage_percentage()
            
            # If usage is over 80%, create an alert
            if usage_percentage >= 80:
                # Get category display name
                category_display = dict(Transaction.Category.choices).get(budget.category, budget.category)
                
                # Create alert message based on percentage
                if usage_percentage >= 100:
                    title = f"Budget exceeded for {category_display}"
                    content = (f"You've exceeded your ${budget.amount:.2f} budget for {category_display}. "
                               f"Consider adjusting your spending or increasing your budget for this category.")
                else:
                    title = f"Budget almost reached for {category_display}"
                    content = (f"You've used {usage_percentage}% of your ${budget.amount:.2f} budget for {category_display}. "
                               f"Be mindful of your spending in this category for the rest of the period.")
                
                # Create the insight
                alert = FinancialInsight(
                    user=user,
                    insight_type=FinancialInsight.InsightType.BUDGET_ALERT,
                    title=title,
                    content=content
                )
                
                # Add data points
                alert.data = {
                    'category': budget.category,
                    'category_display': category_display,
                    'budget_amount': float(budget.amount),
                    'usage_percentage': usage_percentage,
                    'period': budget.period
                }
                
                alerts.append(alert)
        
        return alerts
    
    def _find_savings_opportunities(self, user, transactions):
        """Find potential savings opportunities based on transaction patterns."""
        today = timezone.now().date()
        start_date = today - timedelta(days=30)  # Last month
        
        # Get expenses from the last month
        recent_expenses = transactions.filter(
            transaction_type=Transaction.TransactionType.EXPENSE,
            date__gte=start_date
        )
        
        if not recent_expenses.exists():
            return None
        
        # Simple approach: find categories with frequent small transactions
        # that could be consolidated or reduced
        category_counts = defaultdict(int)
        category_totals = defaultdict(float)
        
        for expense in recent_expenses:
            category_counts[expense.category] += 1
            category_totals[expense.category] += abs(expense.amount)
        
        # Find categories with frequent transactions (at least 5 in a month)
        frequent_categories = [cat for cat, count in category_counts.items() if count >= 5]
        
        if not frequent_categories:
            return None
        
        # Choose a random category from the frequent ones to avoid always showing the same insight
        target_category = random.choice(frequent_categories)
        category_display = dict(Transaction.Category.choices).get(target_category, target_category)
        
        # Create the insight
        insight = FinancialInsight(
            user=user,
            insight_type=FinancialInsight.InsightType.SAVINGS_OPPORTUNITY,
            title=f"Potential savings in {category_display}",
            content=f"You made {category_counts[target_category]} {category_display} transactions last month, "
                   f"totaling ${category_totals[target_category]:.2f}. Consider consolidating these purchases "
                   f"or finding alternatives to reduce this expense."
        )
        
        # Add data points
        insight.data = {
            'category': target_category,
            'category_display': category_display,
            'transaction_count': category_counts[target_category],
            'total_amount': float(category_totals[target_category]),
            'time_period': '1 month'
        }
        
        return insight
    
    def _generate_general_advice(self, user, transactions):
        """Generate general financial advice based on user's financial situation."""
        # Calculate income vs expenses for the last 3 months
        today = timezone.now().date()
        start_date = today - timedelta(days=90)
        
        recent_transactions = transactions.filter(date__gte=start_date)
        
        if not recent_transactions.exists():
            return None
        
        # Calculate total income and expenses
        income = recent_transactions.filter(
            transaction_type=Transaction.TransactionType.INCOME
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expenses = recent_transactions.filter(
            transaction_type=Transaction.TransactionType.EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or 0
        expenses = abs(expenses)
        
        # Calculate savings rate (income - expenses) / income
        savings = income - expenses
        savings_rate = (savings / income) * 100 if income > 0 else 0
        
        # Generate appropriate advice based on savings rate
        if savings_rate < 0:
            title = "Spending exceeds income"
            content = "Your expenses have exceeded your income over the last 3 months. Review your spending and consider creating a budget to help manage your finances."
        elif savings_rate < 10:
            title = "Low savings rate"
            content = "Your savings rate is below 10%. Financial experts recommend saving at least 20% of your income. Consider identifying areas where you can reduce expenses."
        elif savings_rate < 20:
            title = "Good progress on savings"
            content = "You're saving between 10-20% of your income, which is good progress. Try to increase this to 20% or more for long-term financial security."
        else:
            title = "Excellent savings rate"
            content = "You're saving over 20% of your income, which is excellent! Consider investing these savings for long-term growth."
        
        # Create the insight
        insight = FinancialInsight(
            user=user,
            insight_type=FinancialInsight.InsightType.GENERAL_ADVICE,
            title=title,
            content=content
        )
        
        # Add data points
        insight.data = {
            'income': float(income),
            'expenses': float(expenses),
            'savings': float(savings),
            'savings_rate': float(savings_rate),
            'time_period': '3 months'
        }
        
        return insight
