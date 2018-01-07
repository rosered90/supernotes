# -*- coding: utf-8 -*-
# author: DJ
# date: 2018-01-07
# desc: this is ztree background code, used for ztree create,update,delete,get notes etc. actions.
from base_views.base import SingleObjectView
from utils import try_except_class

# Create your views here.
class zTreeBaseView(SingleObjectView):
    level = 3
    btn_list = []

    @try_except_class
    def create_post(self, request, *args, **kwargs):
        pass

    def save_callback(self, request, *args, **kwargs):
        pass
