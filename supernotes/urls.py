"""supernotes URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
import base.urls as base_urls
import diary.urls as diary_urls
import bill.urls as bill_urls
import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^admin/', admin.site.urls),
    url(r'^base/', include(base_urls.urls)),
    url(r'^diary/', include(diary_urls.urls)),
    url(r'^bill/', include(bill_urls.urls)),

    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/$', views.get_view, {"method": 'dt_list'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/search/$', views.get_view, {"method": 'dt_search'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/create/$', views.get_view, {"method": 'create'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/update/(?P<pk>\w+)/$', views.get_view, {"method": 'update'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/delete/(?P<pk>\w+)/$', views.get_view, {"method": 'delete'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/batch_delete/$', views.get_view, {"method": 'batch_delete'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/batch_import/$', views.get_view, {"method": 'batch_import'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/s2search/$', views.get_view, {"method": 's2_search'}),
    url(r'^(?P<app_label>\w+)/(?P<model_name>\w+)/s2read/$', views.get_view, {"method": 's2_read'}),

]
