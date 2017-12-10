# coding:utf-8
from django.shortcuts import render
from django.http import HttpResponse
from account.models.account_tattr import AccountTattr
from account.models.account_type import AccountType


# Create your views here.
def account_index(request):
    account_tattr_objs = AccountTattr.objects.all()
    return render(request, 'tattr_template.html', {'objs': account_tattr_objs})
