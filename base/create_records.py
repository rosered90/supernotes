# -*- coding: utf-8 -*-

class MenuDataGenerator(object):
    def __init__(self):
        super(MenuDataGenerator, self).__init__()
        from base.models.menu import Menu
        self.model = Menu
        self.data = [
            {'name': u'系统管理', 'priority': 6},
            {'name': u'权限', 'parent': u'系统管理', 'priority': 1},
            {'name': u'用户', 'parent': u'权限', 'url': '/base/user', 'alias': 'user', 'priority': 1},
            {'name': u'菜单', 'parent': u'权限', 'url': '/base/menu', 'alias': 'menu', 'priority': 2},
            {'name': u'共享配置', 'parent': u'系统管理', 'priority': 2},
            {'name': u'数据字典', 'parent': u'共享配置', 'priority': 1, 'url': '/base/kvpair', 'alias': 'kvpair'}
        ]
        self.node_dict = {}

    def write_data(self):
        for item in self.data:
            name = item.get('name')
            parent_name = item.get('parent')
            p_obj = None
            if parent_name:
                p_obj = self.node_dict.get(parent_name)
                if not p_obj:
                    p_obj = self.model.objects.get(name=parent_name)
                item['parent'] = p_obj
            obj = self.model.objects.get_or_create(name=name, defaults=item)[0]
            obj.path = p_obj and p_obj.path + '_' + unicode(obj.id) or unicode(obj.id)
            obj.level = p_obj and p_obj.level + 1 or 1
            obj.save()
            self.node_dict[name] = obj


class KVPairDataGenerator(object):
    def __init__(self):
        super(KVPairDataGenerator, self).__init__()
        from base.models.kvinfo import Kvinfo
        from base.models.kvpair import Kvpair
        self.model = Kvpair
        self.kvinfo_model = Kvinfo
        self.kvinfos = [
            {'name': u'账户类型', 'alias': 'AccountType'}
        ]
        self.kvpairs = [
            {'kvinfo': 'AccountType', 'name': u'默认账户', 'alias': 'Default'},
            {'kvinfo': 'AccountType', 'name': u'银行卡账户', 'alias': 'Card'},
            {'kvinfo': 'AccountType', 'name': u'支付宝账户', 'alias': 'Alipay'},
            {'kvinfo': 'AccountType', 'name': u'微信账户', 'alias': 'Wechat'}
        ]

    def write_data(self):
        kvinfo_dict = {}
        for item in self.kvinfos:
            name = item.get('name')
            alias = item.get('alias')
            obj = self.kvinfo_model.objects.get_or_create(name=name, defaults=item)[0]
            kvinfo_dict[alias] = obj
        for item in self.kvpairs:
            name = item.get('name')
            alias = item.get('alias')
            kvinfo = item.get('kvinfo')
            kvinfo_obj = kvinfo_dict.get(kvinfo)
            item['kvinfo'] = kvinfo_obj
            self.model.objects.get_or_create(name=name, defaults=item)


def make_data():
    # 创建初始菜单
    MenuDataGenerator().write_data()

    # 数据字典
    KVPairDataGenerator().write_data()
