# coding:utf-8
from django.shortcuts import render
from django.http import HttpResponse
from bill.models.bill_tattr import BillTattr
from bill.models.bill_type import BillType


# Create your views here.
def bill_index(request):
    bill_tattr_objs = BillTattr.objects.all()
    return render(request, 'tattr_template.html', {'objs': bill_tattr_objs})


def bill_type(request):
    user = request.user
    objs = BillType.objects.filter(create_user=user)
    return render(request, 'bill_type_template.html', {'objs': objs})

