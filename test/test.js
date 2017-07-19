const Distribution = require('../lib');
const should = require('chai').should(); // jshint ignore:line
const services = require('./config').services;

describe('分包', () => {
    it('能够根据数量上线分包, 包裹重量包含包裹自身重量',  () => {
        const order = [{
            _id: 'product_1abd1f3',
            name: '德运奶粉',
            weight: 1300,
            type: '成人奶粉',
            value: 8,
            qty: 14
        }];
        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();

        cost.should.equal(70); // 总费用
        const expressKey = Object.keys(plan);
        Object.keys(plan).length.should.equal(1); // 使用一个快递服务
        plan[expressKey].length.should.equal(2); // 打两个包
    });
    it('能区分杂物与成人奶粉', () => {
        const order = [{
            _id: 'product_1abd1f3',
            name: '德运奶粉',
            weight: 1300,
            type: '成人奶粉',
            value: 8,
            qty: 6
        }, {
            _id: 'product_2abd1f3',
            name: 'Swisse维生素',
            weight: 300,
            type: '保健品',
            value: 15,
            qty: 2,
        }];
        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();
        // 总费用
        cost.should.equal(43.5);
        // 使用两个快递
        Object.keys(plan).length.should.equal(2);
        // 奶粉经济线 - 成人 1 个包裹
        plan.express_1dad4fa.length.should.equal(1);
        // 杂物线 1 个包裹
        plan.express_5dad4fa.length.should.equal(1);
    });

    it('能够识别包裹金额上限', () => {
        const order = [{
            _id: 'product_5abd1f3',
            name: '月光宝盒',
            weight: 200,
            type: '化妆品',
            value: 100,
            qty: 3
        }];
        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();
        // 总费用
        cost.should.equal(12);
        // 使用1个快递
        Object.keys(plan).length.should.equal(1);
        // 杂物线2个包裹
        plan.express_5dad4fa.length.should.equal(2);
    });
});
