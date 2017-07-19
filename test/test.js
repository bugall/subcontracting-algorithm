const Distribution = require('../lib');
const should = require('chai').should(); // jshint ignore:line
const _ = require('lodash');
const services = require('./config').services;

describe('顺丰API - 不拆包', () => {
    // it('能够创建订单', () => {
    //     const order = [{
    //         _id: 'product_1abd1f3',
    //         name: '德运奶粉',
    //         weight: 1300,
    //         type: '成人奶粉',
    //         value: 8,
    //         qty: 10
    //     }, {
    //         _id: 'product_2abd1f3',
    //         name: 'Swisse维生素',
    //         weight: 300,
    //         type: '保健品',
    //         value: 15,
    //         qty: 10,
    //     }];
    //     const distrubution = new Distribution(services, order);
    //     const { plan, cost } = distrubution.showMeTheAnswer();
    //     console.log(plan , cost);
    //     console.log(JSON.stringify(plan));
    // });

    // it('能够创建订单', () => {
    //     const order = [{
    //         _id: 'product_3abd1f3',
    //         name: '爱他美一段',
    //         weight: 1300,
    //         type: '婴儿奶粉',
    //         value: 30,
    //         qty: 3,
    //     }, {
    //         _id: 'product_4abd1f3',
    //         name: '爱他美一段',
    //         weight: 1300,
    //         type: '婴儿奶粉',
    //         value: 40,
    //         qty: 4
    //     }];
    //     const distrubution = new Distribution(services, order);
    //     const { plan, cost } = distrubution.showMeTheAnswer();
    //     console.log(plan , cost);
    // });

    it('能够创建订单', () => {
        const order = [{
            _id: 'product_5abd1f3',
            name: '月光宝盒',
            weight: 200,
            type: '首饰',
            value: 100,
            qty: 3
        }];
        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();
        console.log(plan , cost);
    });
});
