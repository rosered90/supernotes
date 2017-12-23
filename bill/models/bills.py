# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


# Create your models here.
@python_2_unicode_compatible
class Bills(models.Model):
    type = models.ForeignKey('bill.billtype', blank=True, null=True, related_name='+', verbose_name=u'分类')
    money = models.DecimalField(u'金额', default=0, decimal_places=2, max_digits=10)
    account = models.ForeignKey('bill.billaccount', verbose_name=u'分类', related_name='+')
    desc = models.TextField(u'备注', null=True, blank=True)

    create_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name=u'创建人')
    create_date = models.DateTimeField(u'创建时间', auto_now_add=True)
    write_user = models.ForeignKey('auth.user', blank=True, null=True, related_name='+', verbose_name=u'更新人')
    write_date = models.DateTimeField(u'更新时间', auto_now=True)

    def __str__(self):
        return self.type.name

    class Meta:
        db_table = 'bills'
        verbose_name = u'账本'
        verbose_name_plural = u'账本'
