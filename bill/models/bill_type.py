# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# Create your models here.
@python_2_unicode_compatible
class BillType(models.Model):
    name = models.CharField(u'名称', max_length=256, unique=True)
    alias = models.CharField(u'别名', max_length=256, unique=True, blank=True, null=True)
    level = models.IntegerField(u'层级', default=1)
    path = models.CharField(u'路径', max_length=256, default='')
    parent = models.ForeignKey('self', verbose_name=u'父节点', related_name='+', blank=True, null=True)

    create_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name=u'创建人')
    create_date = models.DateTimeField(u'创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name=u'更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'bill_type'
        verbose_name = u'账本分类'
        verbose_name_plural = u'账本分类'
