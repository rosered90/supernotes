# -*- coding:utf-8 -*-
# author: DJ
# date: 2018-01-07
# desc: kvpair module of operations
from django.shortcuts import render
from base_views.base import SingleObjectView
from base.models.kvinfo import Kvinfo
from base.models.kvpair import Kvpair

# Create your views here.
class KvinfoView(SingleObjectView):
    model = Kvinfo
    child_model = Kvpair
    dt_template = 'kvinfo_template.html'