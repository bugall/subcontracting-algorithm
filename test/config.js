const costFirstService = [{
    _id: 'e_1000001',
    name: '奶粉经济线 - 成人',
    type: 'cc',
    rate: 3.5,
    max_qty: 8,
    item_types: [{
        _id: 'e_1000001_1',
        name: '成人奶粉'
    }]
}, {
    _id: 'e_1000002',
    name: '奶粉经济线 - 婴儿',
    type: 'cc',
    rate: 3.5,
    max_qty: 6,
    item_types: [{
        _id: 'e_1000002_1',
        name: '婴儿奶粉'
    }]
}, {
    _id: 'e_1000003',
    name: '奶粉BC线 - 3罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'e_1000003_1',
    }],
    fixed_rate: 15,
    min_qty: 3,
    max_qty: 3
}, {
    _id: 'e_1000004',
    name: '奶粉BC线 - 6罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'e_1000004_1',
    }],
    fixed_rate: 30,
    min_qty: 6,
    max_qty: 6
}, {
    _id: 'e_1000005',
    name: '杂物线',
    type: 'cc',
    item_types: [{
         _id: 'e_1000005_1',
        name: '保健品'
    }, {
         _id: 'e_1000005_2',
        name: '化妆品',
        max_qty: 2 
    }, {
         _id: 'e_1000005_3',
        name: '食品',
        max_qty: 3
    }],
    rate: 6,
    min_weight: 1000,
    max_weight: 3500,
    max_value: 200,
    max_qty: 8
}, {
    _id: 'e_1000006',
    name: '首饰线',
    type: 'cc',
    item_types: [{
        _id: 'e_1000006_1',
        name: '首饰'
    }],
    rate: 6,
    max_weight: 1000,
    max_value: 200,
    max_qty: 3
}];

const speedFirstService = [{
    _id: 'e_1000001',
    name: '奶粉经济线 - 成人',
    type: 'cc',
    rate: 1,
    max_qty: 8,
    item_types: [{
        _id: 'e_1000001_1',
        name: '成人奶粉'
    }]
},{
    _id: 'e_1000011',
    name: '奶粉经济线 - 成人',
    type: 'bc',
    rate: 3.5,
    max_qty: 8,
    item_types: [{
        _id: 'e_1000011_1',
        name: '成人奶粉'
    }]
}, {
    _id: 'e_1000002',
    name: '奶粉经济线 - 婴儿',
    type: 'bc',
    rate: 3.5,
    max_qty: 6,
    item_types: [{
        _id: 'e_1000002_1',
        name: '婴儿奶粉'
    }]
}, {
    _id: 'e_1000003',
    name: '奶粉BC线 - 3罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'e_1000003_1',
    }],
    fixed_rate: 15,
    min_qty: 3,
    max_qty: 3
}, {
    _id: 'e_1000004',
    name: '奶粉BC线 - 6罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉',
        _id: 'e_1000004_1',
    }],
    fixed_rate: 40,
    min_qty: 6,
    max_qty: 6
}, {
    _id: 'e_1000005',
    name: '杂物线',
    type: 'cc',
    item_types: [{
         _id: 'e_1000005_1',
        name: '保健品'
    }, {
         _id: 'e_1000005_2',
        name: '化妆品',
        max_qty: 2 
    }, {
         _id: 'e_1000005_3',
        name: '食品',
        max_qty: 3
    }],
    rate: 6,
    min_weight: 1000,
    max_weight: 3500,
    max_value: 200,
    max_qty: 8
}, {
    _id: 'e_1000006',
    name: '首饰线',
    type: 'cc',
    item_types: [{
        _id: 'e_1000006_1',
        name: '首饰'
    }],
    rate: 6,
    max_weight: 1000,
    max_value: 200,
    max_qty: 3
}, {
    _id: 'e_1000007',
    name: '固态食品线',
    type: 'bc',
    item_types: [{
        _id: 'e_1000007_1',
        name: '食品'
    }],
    rate: 8,
    max_weight: 1000,
    max_value: 200,
    max_qty: 3
}];

module.exports = { costFirstService, speedFirstService };