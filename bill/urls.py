# -*- coding: utf-8 -*-
from django.conf.urls import url
from bill.views.bill_views import bill_index

urlpatterns = [
    url(r'^$', bill_index),
]

urls = urlpatterns
