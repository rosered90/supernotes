# -*- coding: utf-8 -*-
from django.conf.urls import url
from bills.views.bills_view import bills_index

urlpatterns = [
    url(r'^$', bills_index),
]

urls = urlpatterns
