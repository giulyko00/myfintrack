from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'transactions'

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', views.TransactionViewSet.as_view({'get': 'summary'}), name='transaction-summary'),
    path('monthly-summary/', views.TransactionViewSet.as_view({'get': 'monthly_summary'}), name='monthly-summary'),
    path('categories/', views.CategoryAPIView.as_view(), name='categories'),
    # Anche disponibile come metodo nella viewset
    path('transactions/categories/', views.TransactionViewSet.as_view({'get': 'categories'}), name='transaction-categories'),
]
