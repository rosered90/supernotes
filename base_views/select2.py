# -*- coding: utf-8 -*-
# author: DJ
# date: 2018/01/09
# desc: this is select2 background, used for init data and search data,contains static data and synch data.
from django.views.generic.list import BaseListView
from django.http import HttpResponse, Http404
from django.utils.translation import ugettext as _
from django.db.models.query_utils import Q
from utils import try_except_class
import json

# Create your views here.
class S2ReadView(BaseListView):
    model = None

class S2SearchView(BaseListView):
    model = None
