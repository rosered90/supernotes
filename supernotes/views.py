# coding:utf-8
from django.shortcuts import render
from wsgi import *
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.db import connection
from django.contrib.auth.decorators import login_required
from django.apps import apps
import json


# Create your views here.
def index(request):
    return render(request, 'index.html')


def sign_in(request, *args, **kwargs):
    # 点击登录请求模态框
    if request.method.lower() == 'get':
        return render(request,'login.html')
    # 点击登录，判断用户名密码是否正确模块
    elif request.method.lower() == 'post':
        password = request.POST.get('password')
        username = request.POST.get('username')
        user = authenticate(username=username, password=password)
        # 登录成功，从数据库匹配用户名密码
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/')
        # 匹配失败，用户名或者密码错误
        return render(request, 'login.html')


def sign_out(request):
    logout(request)
    return HttpResponseRedirect('/')
