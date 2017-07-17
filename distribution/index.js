'use strick';
const _ = require('lodash');

const services = [{
    _id: 'a8b3f31',
    name: '奶粉经济线 - 成人',
    type: 'cc', // 清关模式
    rate: 3.5,
    max_qty: 8,
    item_types: [{
        name: '成人奶粉'
    }]
}, {
    _id: 'a8b3f32',
    name: '奶粉经济线 - 婴儿',
    type: 'cc',
    rate: 3.5,
    max_qty: 6,
    item_types: [{
        name: '婴儿奶粉'
    }]
}, {
    _id: 'a8b3f33',
    name: '奶粉BC线 - 3罐',
    type: 'bc',
    item_types: [{
        name: '婴儿奶粉'
    }],
    fixed_rate: 15,
    min_qty: 3,
    max_qty: 3
}, {
    _id: 'a8b3f34',
    name: '奶粉BC线 - 6罐',
    type: 'bc',
    item_types: [{ 
        name: '婴儿奶粉'
    }],
    fixed_rate: 30,
    min_qty: 6,
    max_qty: 6
}, {
    _id: 'a8b3f35',
    name: '杂物线',
    type: 'cc',
    item_types: [{
        name: '保健品',
    }, {
        name: '化妆品',
        max_qty: 2 // 包裹内最多2个
    }, {
        name: '食品',
        max_qty: 3 // 包裹内最多3个，但是混搭其他类型，包裹内物品总数可以是8
    }],
    rate: 6,
    min_weight: 1000, // 克，起重，包裹不达到重量按起重算。
    max_weight: 3500, // 克，包裹最大重量
    max_value: 200,
    max_qty: 8 // 包裹最大数量
}, {
    _id: 'a8b3f36',
    name: '首饰线',
    type: 'cc',
    item_types: [{
        name: '首饰'
    }],
    rate: 6,
    max_weight: 1000, // gram
    max_value: 200,
    max_qty: 3 // 包裹最大数量
}];

const orders = [{
    _id: 'd8b3f31',
    name: '德运奶粉',
    weight: 1300,
    type: '成人奶粉',
    value: 8,
    qty: 10
}, {
    _id: 'd8b3f32',
    name: 'Swisse维生素',
    weight: 300,
    type: '保健品',
    value: 15,
    qty: 10,
}];

class Distribution {
    // TODO 三种模式： 'price' 价格优先, 'speed' 速度优先
    
    constructor(services, orders) {
        this.services = services;
        this.orders = orders;
        this.mode = 'speed';
        this.ordersInfo = [];
    }

    generatOrdersDependency() {
        _.forEach(this.orders, (order) => {
            this.ordersInfo[order._id] = _.map(
                _.filter(this.services, (service) => {
                    for (let index in service.item_types) {
                        const type = service.item_types[index];
                        if (type.name === order.type) return true;
                    }
                    return false;
                }), 
            '_id');
        });
        console.log(this.ordersInfo);
    }
    generatOrderCombination(orderId) {

    }
    // 速度优先模式
    setSpeedPreferredMode() {

    }
    
    // 价格优先模式，默认价格优先
    setPricePreferredMode() {

    }

    
}

const distribution = new Distribution(services, orders);
distribution.generatDependency();
