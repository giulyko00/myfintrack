from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from django.core.validators import MinValueValidator


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
