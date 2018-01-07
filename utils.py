# -*- coding: utf-8 -*-
# author: DJ
# date: 2018/01/03
# desc: this is a tool file, supported usefull tool functions.
from django.http import HttpResponse
import traceback, json


def try_except_func(func):
    '''
    try catch 模块的装饰器
    一般用于函数views的前端请求装饰器
    '''

    def wrapper(request, *args, **kwargs):
        result = {}
        try:
            result = func(request, *args, **kwargs)
        except Exception, e:
            _traceback = traceback.format_exc()
            _traceback = _convert_utf8(_traceback)
            err_msg = _convert_utf8(e.message)
            if not err_msg and hasattr(e, 'faultCode') and e.faultCode:
                err_msg = e.faultCode
            result['is_success'] = False
            result['error_msg'] = err_msg
            result['traceback'] = _traceback
        finally:
            return HttpResponse(json.dumps(result))

    return wrapper


def try_except_class(func):
    '''
    try catch 模块的装饰器
    一般用于class函数定义的前端请求装饰器
    '''

    def wrapper(self, request, *args, **kwargs):
        result = {}
        try:
            result = func(self, request, *args, **kwargs)
        except Exception, e:
            _traceback = traceback.format_exc()
            _traceback = _convert_utf8(_traceback)
            err_msg = _convert_utf8(e.message)
            if not err_msg and hasattr(e, 'faultCode') and e.faultCode:
                err_msg = e.faultCode
            result['is_success'] = False
            result['error_msg'] = err_msg
            result['traceback'] = _traceback
        finally:
            return HttpResponse(json.dumps(result))

    return wrapper


def _convert_utf8(txt):
    '''
    强制转换成utf-8编码
    '''
    if txt and isinstance(txt, str):
        return txt.decode('utf-8')
    else:
        return txt
