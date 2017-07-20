const Distribution = require('../lib');
const should = require('chai').should(); // jshint ignore:line
const services = require('./config').services;

describe('分包', () => {
    it('能够根据数量上线分包, 包裹重量包含包裹自身重量',  () => {
        const order = [{
            _id: 'p_1000001',
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
        plan.should.have.property('e_1000001');
        // 打两个包
        plan.e_1000001.length.should.equal(2);
        // 第一个包的信息
        plan.e_1000001[0].item.length.should.equal(1); // 第一个包裹里只有一个种类的商品
        plan.e_1000001[0].item[0].name.should.equal(order[0].name);
        plan.e_1000001[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000001[0].item[0].qty.should.equal(8);
        plan.e_1000001[0].weight.should.equal(10900);
        plan.e_1000001[0].postage.should.equal(38.15);
    });
    it('能区分杂物与成人奶粉', () => {
        const order = [{
            _id: 'p_1000001',
            name: '德运奶粉',
            weight: 1300,
            type: '成人奶粉',
            value: 8,
            qty: 6
        }, {
            _id: 'p_1000003',
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
        plan.should.have.property('e_1000001');
        plan.e_1000001.length.should.equal(1);
        plan.e_1000001[0].item.length.should.equal(1); // 第一个包裹里只有一个种类的商品
        plan.e_1000001[0].item[0].name.should.equal(order[0].name);
        plan.e_1000001[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000001[0].item[0].qty.should.equal(6);
        plan.e_1000001[0].weight.should.equal(8300);
        plan.e_1000001[0].postage.should.equal(29.05);
        // 杂物线 1 个包裹
        plan.should.have.property('e_1000005');
        plan.e_1000005.length.should.equal(1);
        plan.e_1000005[0].item.length.should.equal(1); // 第一个包裹里只有一个种类的商品
        plan.e_1000005[0].item[0].name.should.equal(order[1].name);
        plan.e_1000005[0].item[0]._id.should.equal(order[1]._id);
        plan.e_1000005[0].item[0].qty.should.equal(2);
        plan.e_1000005[0].weight.should.equal(1100);
        plan.e_1000005[0].postage.should.equal(6.6);
    });

    it('能够识别包裹金额上限', () => {
        const order = [{
            _id: 'p_1000004',
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
        plan.should.have.property('e_1000005');
        // 两个包裹
        plan.e_1000005.length.should.equal(2);
        // 第一个包裹
        plan.e_1000005[0].item.length.should.equal(1); // 第一个包裹里只有一个种类的商品
        plan.e_1000005[0].item[0].name.should.equal(order[0].name);
        plan.e_1000005[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000005[0].item[0].qty.should.equal(2);
        plan.e_1000005[0].weight.should.equal(900);
        plan.e_1000005[0].postage.should.equal(6);
        // 第二个包裹
        plan.e_1000005[1].item.length.should.equal(1); // 第一个包裹里只有一个种类的商品
        plan.e_1000005[1].item[0].name.should.equal(order[0].name);
        plan.e_1000005[1].item[0]._id.should.equal(order[0]._id);
        plan.e_1000005[1].item[0].qty.should.equal(1);
        plan.e_1000005[1].weight.should.equal(700); // TODO 是最小重量还是实际重量
        plan.e_1000005[1].postage.should.equal(6);
    });
    it('能够给出婴儿奶粉的组合', () => {
        const order = [{
            _id: 'p_1000005',
            name: '爱他美1段',
            weight: 1300,
            type: '婴儿奶粉',
            value: 30,
            qty: 3,
        }, {
            _id: 'p_1000006',
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
        // 奶粉经济线 - 婴儿 1 个包裹 2 个商品
        plan.should.have.property('e_1000002');
        plan.e_1000002.length.should.equal(1);
        plan.e_1000002[0].postage.should.equal(29.05);
        plan.e_1000002[0].item.length.should.equal(2);
        plan.e_1000002[0].weight.should.equal(8300);
        // 第1个商品
        plan.e_1000002[0].item[0].name.should.equal(order[0].name);
        plan.e_1000002[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000002[0].item[0].qty.should.equal(3);
        // 第2个商品
        plan.e_1000002[0].item[1].name.should.equal(order[1].name);
        plan.e_1000002[0].item[1]._id.should.equal(order[1]._id);
        plan.e_1000002[0].item[1].qty.should.equal(3);
    });

    it('能够正确使用定量包(min_qty & max_qty)', () => {
        const order = [{
            _id: 'p_1000005',
            name: '爱他美1段',
            weight: 1800,
            type: '婴儿奶粉',
            value: 30,
            qty: 3,
        }, {
            _id: 'p_1000006',
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
        plan.should.have.property('e_1000004');
        plan.e_1000004.length.should.equal(1);
        plan.e_1000004[0].postage.should.equal(30);
        plan.e_1000004[0].weight.should.equal(11300);
        plan.e_1000004[0].item.length.should.equal(2);
        // 第1个商品
        plan.e_1000004[0].item[0].name.should.equal(order[0].name);
        plan.e_1000004[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000004[0].item[0].qty.should.equal(3);
        // 第2个商品
        plan.e_1000004[0].item[1].name.should.equal(order[1].name);
        plan.e_1000004[0].item[1]._id.should.equal(order[1]._id);
        plan.e_1000004[0].item[1].qty.should.equal(3);
    });
    it('能够使用定量包,混装多个商品', () => {
        const order = [{
            _id: 'p_1000005',
            name: '爱他美1段',
            weight: 10800,
            type: '婴儿奶粉',
            value: 50,
            qty: 2,
        }, {
            _id: 'p_1000006',
            name: '爱他美2段',
            weight: 10800,
            type: '婴儿奶粉',
            value: 30,
            qty: 2
        }, {
            _id: 'p_1000007',
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
        plan.should.have.property('e_1000004');
        plan.e_1000004.length.should.equal(1);
        plan.e_1000004[0].postage.should.equal(30);
        plan.e_1000004[0].weight.should.equal(65300);
        plan.e_1000004[0].item.length.should.equal(3);
        // 第1个商品
        plan.e_1000004[0].item[0].name.should.equal(order[0].name);
        plan.e_1000004[0].item[0]._id.should.equal(order[0]._id);
        plan.e_1000004[0].item[0].qty.should.equal(2);
        // 第2个商品
        plan.e_1000004[0].item[1].name.should.equal(order[1].name);
        plan.e_1000004[0].item[1]._id.should.equal(order[1]._id);
        plan.e_1000004[0].item[1].qty.should.equal(2);
        // 第3个商品
        plan.e_1000004[0].item[2].name.should.equal(order[2].name);
        plan.e_1000004[0].item[2]._id.should.equal(order[2]._id);
        plan.e_1000004[0].item[2].qty.should.equal(2);
    });
});
