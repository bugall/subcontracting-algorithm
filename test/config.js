const services = [{
    _id: 'express_1dad4fa',
    name: '奶粉经济线 - 成人',
    type: 'cc',
    rate: 3.5,
    max_qty: 8,
    item_types: [{
        _id: 'express_1dad4fa_1',
        name: '成人奶粉'
    }]
}, {
    _id: 'express_2dad4fa',
    name: '奶粉经济线 - 婴儿',
    type: 'cc',
    rate: 3.5,
    max_qty: 6,
    item_types: [{
        _id: 'express_2dad4fa_1',
        name: '婴儿奶粉'
    }]
}, {
    _id: 'express_3dad4fa',
    name: '奶粉BC线 - 3罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'express_3dad4fa_1',
    }],
    fixed_rate: 16,
    min_qty: 3,
    max_qty: 3
}, {
    _id: 'express_4dad4fa',
    name: '奶粉BC线 - 6罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'express_4dad4fa_1',
    }],
    fixed_rate: 30,
    min_qty: 6,
    max_qty: 6
}, {
    _id: 'express_5dad4fa',
    name: '杂物线',
    type: 'cc',
    item_types: [{
         _id: 'express_5dad4fa_1',
        name: '保健品'
    }, {
         _id: 'express_5dad4fa',
        name: '化妆品',
        max_qty: 2 
    }, {
         _id: 'express_5dad4fa',
        name: '食品',
        max_qty: 3
    }],
    rate: 6,
    min_weight: 1000,
    max_weight: 3500,
    max_value: 200,
    max_qty: 8
}, {
    _id: 'express_6dad4fa',
    name: '首饰线',
    type: 'cc',
    item_types: [{
        _id: 'express_6dad4fa_1',
        name: '首饰'
    }],
    rate: 6,
    max_weight: 1000,
    max_value: 200,
    max_qty: 3
}];

module.exports = { services };