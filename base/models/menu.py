# -*- coding:utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# Create your models here.
@python_2_unicode_compatible
class Menu(models.Model):
    name = models.CharField(u'目录', max_length=20)
    alias = models.CharField(u'别名', max_length=256, null=True, blank=True)
    parent = models.ForeignKey('self', blank=True, null=True)
    level = models.IntegerField(u'层级', default=0)
    path = models.CharField(u'路径', max_length=255, default='')
    url = models.CharField(u'url', max_length=200, null=True, blank=True, default='')
    icon = models.CharField(u'图标', max_length=255, null=True, blank=True, default='')
    priority = models.IntegerField(u'优先级', default=0, null=True, blank=True)

    create_user = models.ForeignKey('auth.User', blank=True, null=True, related_name='+', verbose_name=u'创建人')
    create_date = models.DateTimeField('创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.User', blank=True, null=True, related_name='+', verbose_name=u'更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = u'菜单'
        verbose_name_plural = u'菜单'
        db_table = 'base_menu'
