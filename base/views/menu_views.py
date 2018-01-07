# -*- coding:utf-8 -*-
# author: DJ
# date: 2018-01-07
# desc: menu module of operations
from django.shortcuts import render
from base_views.base import SingleObjectView
from base.models.menu import Menu


# Create your views here.
class MenuView(SingleObjectView):
    model = Menu
    dt_template = 'menu_template.html'
