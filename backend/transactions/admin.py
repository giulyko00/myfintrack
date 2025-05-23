from django.contrib import admin
from .models import Transaction


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'get_transaction_type_display', 'get_category_display', 'amount', 'description')
    list_filter = ('transaction_type', 'category', 'date')
    search_fields = ('description', 'user__email')
    list_select_related = ('user',)
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('user', 'amount', 'transaction_type', 'category')
        }),
        ('Additional Information', {
            'fields': ('description', 'date'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)

    def save_model(self, request, obj, form, change):
        if not change:
            obj.user = request.user
        super().save_model(request, obj, form, change)


admin.site.register(Transaction, TransactionAdmin)
