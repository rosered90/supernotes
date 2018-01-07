# coding:utf-8
# author: DJ
# date: 2017-11-06
# desc: generate view of project,it contains index view and tool view(get_view).
from django.shortcuts import render
from wsgi import *
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.db import connection
from django.contrib.auth.decorators import login_required
from django.apps import apps
import json


# Create your views here.
def index(request):
    return render(request, 'index.html')


def get_view(request, *args, **kwargs):
    app_label = kwargs.get('app_label')
    model_name = kwargs.get('model_name')

