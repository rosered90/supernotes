# -*- coding:utf-8 -*-
# author: DJ
# date: 2018-01-07
# desc: user module of operation, include login and logout actions
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from base_views.base import SingleObjectView
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect
from utils import try_except_class
import json


# Create your views here.
class UserView(SingleObjectView):
    model = User
    dt_template = 'user_template.html'

    def login(self, request, *args, **kwargs):
        kwargs['action'] = 'login'
        return self._analy_request(request, *args, **kwargs)

    def login_get(self, request, *args, **kwargs):
        return render(request, 'login.html')

    def login_post(self, request, *args, **kwargs):
        result = {'is_success': True}
        # 获取用户名和密码
        password = request.POST.get('password')
        username = request.POST.get('username')
        # 认证用户名和密码，是否正确
        user = authenticate(username=username, password=password)
        default_url = '/'
        # 如果存在重定向next url 则登录成功后导向next
        redirect_to = request.GET.get('next', '')
        url = redirect_to and redirect_to or default_url
        # 用户名和密码正确，保存cookie，并跳转到重定向的url
        if user is not None:
            if user.is_active:
                login(request, user)
                result['url'] = url
        else:
            # 匹配失败，用户名或者密码错误
            result['is_success'] = False
            result['error_msg'] = u"用户名或者密码错误，请重试！"
        return HttpResponse(json.dumps(result))

    def logout(self, request, *args, **kwargs):
        '''
        退出登录，将url重定向到首页
        '''
        url = '/'
        logout(request)
        return HttpResponseRedirect(url)

    def register(self, request, *args, **kwargs):
        kwargs['action'] = 'register'
        return self._analy_request(request, *args, **kwargs)

    def register_get(self, request, *args, **kwargs):
        return render(request, 'register.html')

    @try_except_class
    def register_post(self, request, *args, **kwargs):
        return HttpResponse
