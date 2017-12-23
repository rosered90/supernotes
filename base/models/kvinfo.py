# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# Create your models here.

@python_2_unicode_compatible
class Kvinfo(models.Model):
    name = models.CharField(u'名称', max_length=256, unique=True)
    alias = models.CharField(u'别名', max_length=256, null=True, unique=True)

    create_user = models.ForeignKey('auth.User', blank=True, null=True, related_name='+', verbose_name=u'创建人')
    create_date = models.DateTimeField(u'创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.User', blank=True, null=True, related_name='+', verbose_name=u'更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'base_kvinfo'
        verbose_name = u'数据字典信息'
        verbose_name_plural = u'数据字典信息'
