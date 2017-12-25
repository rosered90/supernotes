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
from .views import sign_in, sign_out, index

urlpatterns = [
    url(r'^$', index),
    url(r'^admin/', admin.site.urls),
    url(r'^base/', base_urls.urls),
    url(r'^diary/', include(diary_urls.urls)),
    url(r'^bill/', include(bill_urls.urls)),

    url(r'^login/', sign_in),
    url(r'^logout/', sign_out),
]
