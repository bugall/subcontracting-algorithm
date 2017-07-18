'use strick';
const _ = require('lodash');
class Distribution {
    // TODO 2种模式： 'price' 价格优先, 'speed' 速度优先
    constructor(services, order) {
        this.services = services; // 快递服务的配置
        this.order = order; // 订单信息
        this.mode = 'speed'; // 默认速度优先
        this.productsInfo = []; // 商品的信息[商品与服务的关系]
        this.orderRecursiveInfo = {}; // 保存订单里每个商品对应的快递的排列组合信息
        this.orderExpressPackageInfo = {}; // 订单装包的情况, 每个快递包的使用情况
        this.productPackageInfo = {}; // 分包方案
        this.finalAnswer= {}; // 最终生成的快递订单信息
        this.optimalProductPackageInfo ={}; // 最优的分包方案
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
        return { success: serviceDistFlag, packageCounterInfo: packageCounterInfo };
    }
    caculCost() {

    }
    // 查看整个订单是否满足services
    checkOrderServicesValid() {
        const products = Object.keys(this.orderRecursiveInfo);
        _.forEach(products, (productId) => {
            this.takeProductToExpressPackage(productId);
        });
        this.calculationCost();
        this.productPackageInfo = {};
        this.orderExpressPackageInfo = {};
    }
    takeProductToExpressPackage(productId) {
        const productRecursiveInfo = this.orderRecursiveInfo[productId]; // 商品对应服务的排列组合信息
        const productDependency = this.productsInfo[productId].dependency; // 商品对应的服务列表
        const productInfo = _.filter(this.order, (product) => product._id === productId)[0]; // 订单中商品的具体描述
        let serviceDistFlag = true;
        // 把所有商品进行装包
        _.forEach(productRecursiveInfo, (value, index) => {
            if (value === 0) return;
            // 找到快递服务的对应的具体信息
            const serviceInfo = _.filter(this.services, (service) => service._id === productDependency[Number(index - 1)])[0];
            // init
            if (_.isEmpty(this.orderExpressPackageInfo[serviceInfo._id])) {
                this.initOrderExpressPackageByServiceId(serviceInfo._id);
            }
            // 判断是否可以满足
            let productCounter = 0;
            let packageCounter = 1;
            // 限制
            const secondLevelInfo = _.filter(this.services, (service) => service._id === serviceInfo._id)[0];
            const secondLevelServiceId = _.filter(secondLevelInfo.item_types, (item) => item.name === productInfo.type)[0]._id;
            const secondLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].secondInfo[secondLevelServiceId];
            const topLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].topInfo;
            
            // 一个一个的装包，知道商品装完
            while (productCounter !== value) {
                let allCheckFlag = 4;
                // 一级限制判断
                if ((topLevelPackageInfo.weight + productInfo.weight <= serviceInfo.max_weight) || !serviceInfo.max_weight) {
                    allCheckFlag--;
                }
                if ((topLevelPackageInfo.qty + 1 <= serviceInfo.max_qty) || !serviceInfo.max_qty) {
                    allCheckFlag--;
                }
                // 二级限制判断
                if ((secondLevelPackageInfo.weight + productInfo.weight) <= secondLevelInfo.max_weight || !secondLevelInfo.max_weight) {
                    allCheckFlag--;
                }
                if ((secondLevelPackageInfo.qty + 1 <= secondLevelInfo.max_qty) || !secondLevelInfo.max_qty) {
                    allCheckFlag--;
                }
                // 限制条件全都通过
                if (allCheckFlag === 0) {
                    topLevelPackageInfo.weight += productInfo.weight;
                    topLevelPackageInfo.qty++;
                    secondLevelPackageInfo.weight += productInfo.weight;
                } else {
                    // 新建一个包继续装
                    packageCounter++;
                }
                productCounter++;
            }
            // 如果有分配商品,但是不能顺利装包
            if (productCounter !== value && value !== 0) {
                // console.log('Illegal dist:',serviceInfo, value);
                serviceDistFlag = false;
            } else {
                // 记录满足商品的前提下, 使用了多少个包
                if (_.isEmpty(this.productPackageInfo[serviceInfo._id])) {
                    this.productPackageInfo[serviceInfo._id] = packageCounter;
                } else {
                    this.productPackageInfo[serviceInfo._id] += packageCounter;
                }
            }
        });
    }
    calculationCost() {
        // this.orderRecursiveInfo = { d8b3f31: { '1': 3, '2': 0 }, d8b3f32: { '1': 3 } }
        // this.productsinfo = { d8b3f31: { dependency: [ 'a8b3f31', 'a8b3f32' ] }, d8b3f32: { dependency: [ 'a8b3f35' ] } }
        const productPackageInfo = {};
        for (let product in this.orderRecursiveInfo) {
            const tmp = {};
            _.forEach(this.orderRecursiveInfo[product], (value, index) => {
                tmp[this.productsInfo[product].dependency[Number(index) - 1]] = value;
            });
            productPackageInfo[product] = tmp;
        }
        console.log(productPackageInfo);
    }
    initOrderExpressPackageByServiceId(serviceId) {
        const initOpt = {
            qty: 0,
            weight: 0,
        };
        // 初始化一级约束的结构
        this.orderExpressPackageInfo[serviceId] = {
            topInfo: initOpt, 
            secondInfo: {}
        };
        // 初始化二级约束的结构
        _.forEach(this.services, (service) => {
            if (service._id === serviceId) {
                _.forEach(service.item_types, (item) => {
                    this.orderExpressPackageInfo[serviceId].secondInfo[item._id] = initOpt;
                });
            };
        });
    }
    // 速度优先模式
    setSpeedPreferredMode() {
    }
    
    // 价格优先模式，默认价格优先
    setPricePreferredMode() {
    }
}
module.exports = Distribution;