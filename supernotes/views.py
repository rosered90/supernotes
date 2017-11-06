# coding:utf-8
from django.shortcuts import render
from wsgi import *
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.db import connection
from django.contrib.auth.decorators import login_required
from base.models.menu import Menu
from django.apps import apps


# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'index.html')


def sign_in(request, *args, **kwargs):
    password = request.POST.get('password')
    username = request.POST.get('username')
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return HttpResponseRedirect('/')
    return render(request, 'login.html')


def sign_out(request):
    logout(request)
    return HttpResponseRedirect('/')
