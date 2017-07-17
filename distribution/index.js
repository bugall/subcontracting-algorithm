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
        name: '成人奶粉'
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
    // TODO 2种模式： 'price' 价格优先, 'speed' 速度优先
    constructor(services, order) {
        this.services = services;
        this.order = order;
        this.mode = 'speed';
        this.productsInfo = [];
        this.orderRecursiveInfo = {};
        this.finalAnswer= {};
    }

    generatOrderDependency() {
        _.forEach(this.order, (product) => {
            // init
            this.orderRecursiveInfo[product._id] = {};
            this.productsInfo[product._id] = { dependency: {} };
            
            this.productsInfo[product._id].dependency = _.map(
                _.filter(this.services, (service) => {
                    for (let index in service.item_types) {
                        const type = service.item_types[index];
                        if (type.name === product.type) return true;
                    }
                    return false;
                }), 
            '_id');
        });
    }
    generatProductCombination(productId, productCounter, layerCounter, cb) {
        const productInfo = _.filter(this.order, (product) => product._id === productId)[0];
        const productTotal = productInfo.qty;
        if (layerCounter <=0 ) {
            if (productCounter === productTotal) cb();
            return;
        }
        for (let i = 0; i <= productTotal; i++) {
            if (productCounter + i <= productTotal && layerCounter > 0 ) {
                this.orderRecursiveInfo[productId][layerCounter] =  i;
                this.generatProductCombination(productId, productCounter + i, layerCounter-1, cb);
            }
        }
    }
    productCombinationProxy(productIndex) {
        // 找到一种组合
        if (productIndex >= this.order.length) {
            this.checkOrderServicesValid();
            return;
        }
        
        const productId = this.order[productIndex]._id;
        this.generatProductCombination(productId, 0, this.productsInfo[productId].dependency.length, () => {
            // TODO 把check写完就ok了。
            // TODO 阶段检测优化暂时不做,直接检查最终状态的合法性
            // const { successFlag, packageCounterInfo } = this.checkProductServicesValid(productId);
            if (1 === 1) {
                this.productCombinationProxy(productIndex+1);
            }
        });
    }
    showMeTheAnswer() {
        this.generatOrderDependency();
        this.productCombinationProxy(0);
    }
    // 查看商品对应的services是否满足
    checkProductServicesValid(productId) {
        // 产品的排列组合数 {'1': 10, '2': 0}
        const productRecursiveInfo = this.orderRecursiveInfo[productId];
        const productDependency = this.productsInfo[productId].dependency;
        const productInfo = _.forEach(this.order, (product) => product._id === productId)[0];
        const packageCounterInfo = {};
        let serviceDistFlag = true;
        _.forEach(productRecursiveInfo, (value, index) => {
            // 10个商品通过1号服务
            const serviceInfo = _.filter(this.services, (service) => service._id === productDependency[Number(index - 1)])[0];
            // 判断是否可以满足
            let productCounter = 0;
            let packageCounter = 1;
            let packageInfo = {
                weight: 0,
                qty: 0,
            };
            while (productCounter !== value) {
                let allCheckFlag = 2;
                // 开始一个个的装包
                if (packageInfo.weight + productInfo.weight <= serviceInfo.max_weight || 
                    _.isEmpty(serviceInfo.max_weight)) {
                    allCheckFlag--;
                }
                if (packageInfo.qty + 1 <= serviceInfo.max_qty ||
                    _.isEmpty(serviceInfo.max_qty)) {
                    allCheckFlag--;
                }
                if (allCheckFlag === 0) {
                    packageInfo.weight += productInfo.weight;
                    packageInfo.qty++;
                } else {
                    packageInfo = {
                        weight: 0,
                        qty: 0
                    };
                    packageCounter++;
                }
                productCounter++;
            }
            // if (value !== 0) {
            //     console.log(value,'---' ,packageCounter,'----',serviceInfo,'---' , packageInfo,'---' , productInfo, '---------------------------');
            // }
            // 如果有分配商品,但是不能顺利装包
            if (productCounter !== value && value !== 0) {
                // console.log('Illegal dist:',serviceInfo, value);
                serviceDistFlag = false;
            } else {
                // 记录满足商品的前提下, 使用了多少个包
                packageCounterInfo[serviceInfo._id] = packageCounter;
            }
        });
        return { success: serviceDistFlag, packageCounterInfo: packageCounterInfo };
    }
    caculCost() {

    }
    // 查看整个订单是否满足services
    checkOrderServicesValid() {

    }
    // 速度优先模式
    setSpeedPreferredMode() {
    }
    
    // 价格优先模式，默认价格优先
    setPricePreferredMode() {
    }
}

const distribution = new Distribution(services, orders);
distribution.showMeTheAnswer();
