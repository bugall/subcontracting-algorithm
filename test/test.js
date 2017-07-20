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

        // 总费用
        cost.should.equal(67.2); 
        // 使用一个快递服务
        Object.keys(plan).length.should.equal(1);
        plan.should.have.property('express_1dad4fa');
        // 打两个包
        plan.express_1dad4fa.length.should.equal(2); 
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
        cost.should.equal(35.6);
        Object.keys(plan).length.should.equal(2);
        // 奶粉经济线 - 成人 1 个包裹
        plan.should.have.property('express_1dad4fa');
        plan.express_1dad4fa.length.should.equal(1);
        // 杂物线 1 个包裹
        plan.should.have.property('express_5dad4fa');
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
        plan.should.have.property('express_5dad4fa');
        plan.express_5dad4fa.length.should.equal(2);
    });
    it('能够给出婴儿奶粉的组合', () => {
        const order = [{
            _id: 'product_6abd1f3',
            name: '爱他美1段',
            weight: 1300,
            type: '婴儿奶粉',
            value: 30,
            qty: 3,
        }, {
            _id: 'product_7abd1f3',
            name: '爱他美2段',
            weight: 1300,
            type: '婴儿奶粉',
            value: 40,
            qty: 3
        }];

        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();
        
        // 总费用
        cost.should.equal(29.1);
        // 使用1个快递
        Object.keys(plan).length.should.equal(1);
        // 奶粉经济线 - 婴儿 1 包裹
        plan.should.have.property('express_2dad4fa');
        plan.express_2dad4fa.length.should.equal(1);
    });

    it('能够正确使用定量包(min_qty & max_qty)', () => {
        const order = [{
            _id: 'product_6abd1f3',
            name: '爱他美1段',
            weight: 1800,
            type: '婴儿奶粉',
            value: 30,
            qty: 3,
        }, {
            _id: 'product_7abd1f3',
            name: '爱他美2段',
            weight: 1800,
            type: '婴儿奶粉',
            value: 40,
            qty: 3
        }];

        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();
        
        // 总费用
        cost.should.equal(30);
        // 使用1个快递
        Object.keys(plan).length.should.equal(1);
        // 奶粉BC线 1 定量包裹
        plan.should.have.property('express_4dad4fa');
        plan.express_4dad4fa.length.should.equal(1);
    });
    it('能够使用定量包,混装多个商品', () => {
        const order = [{
            _id: 'product_6abd1f3',
            name: '爱他美1段',
            weight: 10800,
            type: '婴儿奶粉',
            value: 50,
            qty: 2,
        }, {
            _id: 'product_7abd1f3',
            name: '爱他美2段',
            weight: 10800,
            type: '婴儿奶粉',
            value: 30,
            qty: 2
        }, {
            _id: 'product_8abd1f3',
            name: '爱他美3段',
            weight: 10800,
            type: '婴儿奶粉',
            value: 20,
            qty: 2
        }];
        const distrubution = new Distribution(services, order);
        const { plan, cost } = distrubution.showMeTheAnswer();

        // 使用一个定量包
        cost.should.equal(30);
        // 使用一个快递 
        Object.keys(plan).length.should.equal(1);
        // 一个定量包奶粉BC线 - 6罐
        plan.should.have.property('express_4dad4fa');
        plan.express_4dad4fa.length.should.equal(1);
    });
});
