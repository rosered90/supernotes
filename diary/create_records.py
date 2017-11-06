# -*- coding: utf-8 -*-
# @Date : 2017-11-06
# @Author   : DJ
# @Desc     : create production data or setting data for diary

class DiaryTattrsTypesDataGenerator(object):
    def __init__(self):
        super(DiaryTattrsTypesDataGenerator, self).__init__()
        from diary.models.diary_tattr import DiaryTattrType
        self.model = DiaryTattrType
        self.data = [
            {'name': u'字符串', 'alias': u'CharField'},
            {'name': u'密码', 'alias': u'PasswordField'},
            {'name': u'文本', 'alias': u'TextField'},
            {'name': u'bool', 'alias': u'BooleanField'},
            {'name': u'日期', 'alias': u'DateField'},
            {'name': u'时间日期', 'alias': u'DateTimeField'},
            {'name': u'时间', 'alias': u'TimeField'},
            {'name': u'浮点数', 'alias': u'FloatField'},
            {'name': u'小数', 'alias': u'DecimalField'},
            {'name': u'整数', 'alias': u'IntegerField'},
            {'name': u'长整形', 'alias': u'BigIntegerField'},
            {'name': u'Email', 'alias': u'EmailField'},
            {'name': u'IP地址', 'alias': u'IPAddressField'},
            {'name': u'URL', 'alias': u'URLField'},
            {'name': u'引用', 'alias': u'ForeignKey'},
        ]

    def write_data(self):
        for item in self.data:
            name = item.get('name')
            alias = item.get('alias')
            self.model.objects.get_or_create(name=name, alias=alias)