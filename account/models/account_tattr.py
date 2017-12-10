# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# Create your models here.
@python_2_unicode_compatible
class AccountTattr(models.Model):
    name = models.CharField(u'名称', max_length=256, unique=True)
    alias = models.CharField(u'别名', max_length=256, unique=True, blank=True, null=True)
    type = models.ForeignKey('AccountTattrType', related_name='+', verbose_name='类型')
    readonly = models.BooleanField(u'只读', default=False)
    require = models.BooleanField(u'必填', default=False)
    source = models.ForeignKey('contenttypes.contenttype', related_name='+', verbose_name='数据源', blank=True, null=True)
    filters = models.CharField(u'过滤器', max_length=256, blank=True, null=True)
    priority = models.IntegerField(u'优先级', default=0)
    m_view = models.BooleanField(u'主视图', default=True)
    sortable = models.BooleanField(u'排序', default=True)
    d_type = models.ForeignKey('diary.diarytype', related_name='+', verbose_name='源模板')
    default = models.CharField(u'默认值', max_length=256, blank=True, null=True)

    create_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name='创建人')
    create_date = models.DateTimeField(u'创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name='更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'account_tattr'
        verbose_name = u'账本分类属性'
        verbose_name_plural = u'账本分类属性'


@python_2_unicode_compatible
class AccountTattrType(models.Model):
    name = models.CharField(u'类型', max_length=256)
    alias = models.CharField(u'别名', max_length=256)

    create_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name='创建人')
    create_date = models.DateTimeField(u'创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name='更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = u'账本属性类型'
        verbose_name_plural = u'账本属性类型'
        db_table = 'account_tattr_type'
