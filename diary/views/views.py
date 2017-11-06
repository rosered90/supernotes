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
