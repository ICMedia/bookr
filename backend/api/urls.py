from django.conf.urls import include, url
from rest_framework_extensions.routers import ExtendedDefaultRouter
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token
from . import views

bookings_router = ExtendedDefaultRouter()

(bookings_router.register(r'bookables', views.BookableViewSet)
 .register(r'booking-parts', views.BookingPartViewSet, 'bookables-bookingpart', parents_query_lookups=['bookable']))
(bookings_router.register(r'bookings', views.BookingViewSet)
 .register(r'booking-parts', views.BookingPartViewSet, 'bookings-bookingpart', parents_query_lookups=['booking']))
bookings_router.register(r'booking-parts', views.BookingPartViewSet)

urlpatterns = [
    url(r'^auth/token/$', obtain_jwt_token),
    url(r'^auth/token/refresh/$', refresh_jwt_token),

    url(r'^user/', views.CurrentUserView.as_view()),
    url(r'^bookings/', include(bookings_router.urls)),
]
