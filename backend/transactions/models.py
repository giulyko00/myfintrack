from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from datetime import date
import json


class Transaction(models.Model):
    """Model representing a financial transaction (income or expense)."""
    
    class TransactionType(models.TextChoices):
        INCOME = 'IN', _('Income')
        EXPENSE = 'EX', _('Expense')
    
    class Category(models.TextChoices):
        # Income categories
        SALARY = 'SALARY', _('Salary')
        FREELANCE = 'FREELANCE', _('Freelance')
        INVESTMENT = 'INVESTMENT', _('Investment')
        GIFT = 'GIFT', _('Gift')
        OTHER_INCOME = 'OTHER_INC', _('Other Income')
        
        # Expense categories
        HOUSING = 'HOUSING', _('Housing')
        FOOD = 'FOOD', _('Food')
        TRANSPORTATION = 'TRANSPORT', _('Transportation')
        HEALTH = 'HEALTH', _('Health')
        ENTERTAINMENT = 'ENTERTAIN', _('Entertainment')
        EDUCATION = 'EDUCATION', _('Education')
        SHOPPING = 'SHOPPING', _('Shopping')
        UTILITIES = 'UTILITIES', _('Utilities')
        TRAVEL = 'TRAVEL', _('Travel')
        OTHER_EXPENSE = 'OTHER_EXP', _('Other Expense')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    transaction_type = models.CharField(
        _('transaction type'),
        max_length=2,
        choices=TransactionType.choices
    )
    category = models.CharField(
        _('category'),
        max_length=10,
        choices=Category.choices
    )
    description = models.TextField(_('description'), blank=True)
    date = models.DateField(_('date'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = _('transaction')
        verbose_name_plural = _('transactions')
    
    def __str__(self):
        return f"{self.get_transaction_type_display()}: {self.amount} - {self.get_category_display()} ({self.date})"
    
    @property
    def is_income(self):
        """Check if the transaction is an income."""
        return self.transaction_type == self.TransactionType.INCOME
    
    @property
    def is_expense(self):
        """Check if the transaction is an expense."""
        return self.transaction_type == self.TransactionType.EXPENSE


class Budget(models.Model):
    """Model representing a monthly budget for expense categories."""
    
    class Period(models.TextChoices):
        MONTHLY = 'MONTHLY', _('Monthly')
        YEARLY = 'YEARLY', _('Yearly')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.CharField(
        _('category'),
        max_length=10,
        choices=Transaction.Category.choices
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    period = models.CharField(
        _('period'),
        max_length=10,
        choices=Period.choices,
        default=Period.MONTHLY
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        ordering = ['category']
        verbose_name = _('budget')
        verbose_name_plural = _('budgets')
        # Ensure user can only have one budget per category per period
        unique_together = ['user', 'category', 'period']
    
    def __str__(self):
        return f"Budget: {self.get_category_display()} - ${self.amount} ({self.get_period_display()})"
    
    def get_usage_percentage(self, year=None, month=None):
        """Calculate what percentage of the budget has been used."""
        # Default to current year and month
        today = date.today()
        year = year or today.year
        month = month or today.month
        
        # Calculate the amount spent in this category for the period
        from django.db.models import Sum
        if self.period == self.Period.MONTHLY:
            # For monthly budget, get sum of expenses in the specific month
            spent = Transaction.objects.filter(
                user=self.user,
                transaction_type=Transaction.TransactionType.EXPENSE,
                category=self.category,
                date__year=year,
                date__month=month
            ).aggregate(total=Sum('amount'))
        else:  # YEARLY
            # For yearly budget, get sum of expenses in the entire year
            spent = Transaction.objects.filter(
                user=self.user,
                transaction_type=Transaction.TransactionType.EXPENSE,
                category=self.category,
                date__year=year
            ).aggregate(total=Sum('amount'))
        
        # Calculate percentage of budget used
        if not spent['total']:
            return 0
        
        return min(100, int((abs(spent['total']) / self.amount) * 100))


class FinancialInsight(models.Model):
    """Model for storing AI-generated financial insights for users."""
    
    class InsightType(models.TextChoices):
        SPENDING_PATTERN = 'SPENDING', _('Spending Pattern')
        SAVINGS_OPPORTUNITY = 'SAVINGS', _('Savings Opportunity')
        BUDGET_ALERT = 'BUDGET', _('Budget Alert')
        GENERAL_ADVICE = 'GENERAL', _('General Advice')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='financial_insights'
    )
    insight_type = models.CharField(
        _('insight type'),
        max_length=10,
        choices=InsightType.choices
    )
    title = models.CharField(_('title'), max_length=100)
    content = models.TextField(_('content'))
    data_points = models.TextField(_('data points'), blank=True, null=True, help_text=_('JSON serialized data to support the insight'))
    is_read = models.BooleanField(_('is read'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('financial insight')
        verbose_name_plural = _('financial insights')
    
    def __str__(self):
        return f"{self.get_insight_type_display()}: {self.title}"
    
    @property
    def data(self):
        """Return the data points as a Python object."""
        if not self.data_points:
            return {}
        try:
            return json.loads(self.data_points)
        except json.JSONDecodeError:
            return {}
    
    @data.setter
    def data(self, value):
        """Store the data points as a JSON string."""
        self.data_points = json.dumps(value)
