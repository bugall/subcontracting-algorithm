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
        this.usePackageCounter = {}; // 分包方案
        this.finalAnswer= {}; // 最终生成的快递订单信息
        this.optimalUsePackage ={}; // 最优的分包方案
        this.optimalCost = 10e9;
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
            // TODO 阶段检测优化暂时不做,直接检查最终状态的合法性
            if (1 === 1) {
                this.productCombinationProxy(productIndex+1);
            }
        });
    }
    showMeTheAnswer() {
        this.generatOrderDependency();
        this.productCombinationProxy(0);
        return { plan: this.optimalUsePackage, cost: this.optimalCost };
    }
    // 查看整个订单是否满足services
    checkOrderServicesValid() {
        const products = Object.keys(this.orderRecursiveInfo);
        _.forEach(products, (productId) => {
            this.takeProductToExpressPackage(productId);
        });
        this.calculationCost();
        this.usePackageCounter = {};
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
            // 限制
            const secondLevelInfo = _.filter(this.services, (service) => service._id === serviceInfo._id)[0];
            const secondLevelServiceId = _.filter(secondLevelInfo.item_types, (item) => item.name === productInfo.type)[0]._id;
            let secondLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].secondInfo[secondLevelServiceId];
            let topLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].topInfo;
            
            let singlePackageProductCounter = 0;
            let useNewPackage = true;
            // 有可能上一个包在装上一个商品的时候有空余空间,使用上一个包
            if (topLevelPackageInfo.weight !== 0) {
                useNewPackage = false;
            }
            // 一个一个的装包，直到商品装完
            while (productCounter !== value) {
                // TODO 逻辑代码冗余
                let allCheckFlag = 6;
                // 一级限制判断
                // 重量
                if ((topLevelPackageInfo.weight + productInfo.weight <= serviceInfo.max_weight) || !serviceInfo.max_weight) {
                    allCheckFlag--;
                }
                // 价值
                if ((topLevelPackageInfo.value + productInfo.value <= serviceInfo.max_value) || !serviceInfo.max_value) {
                    allCheckFlag--;
                }
                // 数量
                if ((topLevelPackageInfo.qty + 1 <= serviceInfo.max_qty) || !serviceInfo.max_qty) {
                    allCheckFlag--;
                }
                
                // 二级限制判断
                if ((secondLevelPackageInfo.weight + productInfo.weight) <= secondLevelInfo.max_weight || !secondLevelInfo.max_weight) {
                    allCheckFlag--;
                }
                if ((secondLevelPackageInfo.value + productInfo.value) <= secondLevelInfo.max_value || !secondLevelInfo.max_value) {
                    allCheckFlag--;
                }
                if ((secondLevelPackageInfo.qty + 1 <= secondLevelInfo.max_qty) || !secondLevelInfo.max_qty) {
                    allCheckFlag--;
                }
                
                if (allCheckFlag !== 0) {
                    if (_.isEmpty(this.usePackageCounter[serviceInfo._id])) {
                        this.usePackageCounter[serviceInfo._id] = [{[productInfo._id]: singlePackageProductCounter}];
                    } else {
                        if (useNewPackage || singlePackageProductCounter === 0) {
                            this.usePackageCounter[serviceInfo._id].push({[productInfo._id]: singlePackageProductCounter});
                        } else {
                            const leng = this.usePackageCounter[serviceInfo._id].length - 1;
                            this.usePackageCounter[serviceInfo._id][leng][productInfo._id] = singlePackageProductCounter;
                            useNewPackage = true;
                        }
                    }
                    singlePackageProductCounter = 0;
                    this.initOrderExpressPackageByServiceId(serviceInfo._id);
                    secondLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].secondInfo[secondLevelServiceId];
                    topLevelPackageInfo = this.orderExpressPackageInfo[serviceInfo._id].topInfo;
                }
                topLevelPackageInfo.weight += productInfo.weight;
                topLevelPackageInfo.qty++;
                secondLevelPackageInfo.weight += productInfo.weight;

                singlePackageProductCounter++;
                productCounter++;
            }
            // 如果有分配商品,但是不能顺利装包
            if (productCounter !== value && value !== 0) {
                // console.log('Illegal dist:',serviceInfo, value);
                serviceDistFlag = false;
            } else {
                if (_.isEmpty(this.usePackageCounter[serviceInfo._id])) {
                    this.usePackageCounter[serviceInfo._id] = [{[productInfo._id]: singlePackageProductCounter}];
                } else {
                    this.usePackageCounter[serviceInfo._id].push({[productInfo._id]: singlePackageProductCounter});
                }
            }
        });
    }
    calculationCost() {
        // this.orderRecursiveInfo = { d8b3f31: { '1': 3, '2': 0 }, d8b3f32: { '1': 3 } }
        // this.productsinfo = { d8b3f31: { dependency: [ 'a8b3f31', 'a8b3f32' ] }, d8b3f32: { dependency: [ 'a8b3f35' ] } }
        const tmpPackageInfo = {};
        const usePackageCounter = {};
        for (let product in this.orderRecursiveInfo) {
            const tmp = {};
            _.forEach(this.orderRecursiveInfo[product], (value, index) => {
                tmp[this.productsInfo[product].dependency[Number(index) - 1]] = value;
            });
            usePackageCounter[product] = tmp;
        }
        let allCost = 0;
        for(let expressId in this.usePackageCounter) {
            let productInfo = {}
            _.forEach(this.order, (product) => {
                productInfo[product._id] = product;
            });
            const expressInfo = _.filter(this.services, (service) => service._id === expressId)[0];
            const packages = this.usePackageCounter[expressId];
            tmpPackageInfo[expressId] = [];
            _.forEach(packages, (packageInfo) => {
                let packageWeight = 0;
                let tmp = [];
                for(let productId in packageInfo) {
                    packageWeight += productInfo[productId].weight * packageInfo[productId];
                    tmp.push({
                        _id: productId,
                        name: productInfo[productId].name,
                        qty: packageInfo[productId],
                    });
                }
                const packageRate = Number((expressInfo.rate * Math.ceil( packageWeight / 1000)).toFixed(1));
                allCost += packageRate;
                tmpPackageInfo[expressId].push({
                    item: tmp,
                    weight: packageWeight,
                    postage: packageRate,
                    service: expressInfo.name
                });
            });
        }
        if (allCost < this.optimalCost) {
            this.optimalUsePackage = tmpPackageInfo;
            this.optimalCost = allCost;
        }
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
            }
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