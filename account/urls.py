# -*- coding: utf-8 -*-
from django.conf.urls import url

urlpatterns = [
    url(r'^$', admin.site.urls),
]

urls = urlpatterns
