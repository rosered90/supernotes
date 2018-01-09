# -*- coding: utf-8 -*-
from django.conf.urls import url
import base.views.user_views as user_views

user = user_views.UserView()
urlpatterns = [
    url(r'^login/$', user.login),
    url(r'^logout/$', user.logout),

    url(r'^register/$', user.create),
]

urls = urlpatterns
