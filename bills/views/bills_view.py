# coding:utf-8
from django.shortcuts import render
from django.http import HttpResponse
from bills.models.bills_tattr import BillsTattr

# Create your views here.
def bills_index(request):
    bills_tattr_objs = BillsTattr.objects.all()
    return render(request, 'tattr_template.html', {'objs': bills_tattr_objs})
