'use strick';
const _ = require('lodash');
class Distribution {
    // TODO 2种模式： 'price' 价格优先, 'speed' 速度优先
    constructor(services, order) {
        this.services = services; // 快递服务的配置
        this.order = order; // 订单信息
        this.servicesInfoMap = {}; // service hash map
        this.productInfoMap = {}; // order hash map
        this.mode = 'speed'; // 默认速度优先
        this.productsInfo = []; // 商品的信息[商品与服务的关系]
        this.orderRecursiveInfo = {}; // 保存订单里每个商品对应的快递的排列组合信息
        this.orderExpressBagInfo = {}; // 订单装包的情况, 每个快递包的使用情况
        this.useBagCounter = {}; // 分包方案
        this.optimalUseBag ={}; // 最优的分包方案
        this.optimalCost = 10e9;
        this.optimalSpeedFirst = {}; // 速度优先的最优分包方案
        this.optimalSpeedFirstCounter = -10e9;
        this.optimalSpeedFirstCost = 10e9;
    }
    generatOrderDependency() {
        _.forEach(this.order, (product) => {
            this.productInfoMap[product._id] = product;
            this.orderRecursiveInfo[product._id] = {};
            this.productsInfo[product._id] = { dependency: {} };
            
            this.productsInfo[product._id].dependency = _.map(
                _.filter(this.services, (service) => {
                    this.servicesInfoMap[service._id] = service;
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
        const productTotal = this.productInfoMap[productId].qty;
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
    showMeTheAnswer(type) {
        this.generatOrderDependency();
        this.productCombinationProxy(0);
        let answer = null;
        switch(type) {
            case 'money':
                answer = { plan: this.optimalUseBag, cost: Number(this.optimalCost.toFixed(1)) };
                break;
            case 'speed':
                answer = { plan: this.optimalSpeedFirst, cost: Number(this.optimalSpeedFirstCost.toFixed(1)) };
                break;
        }
        return answer;
    }
    // 查看整个订单是否满足services
    checkOrderServicesValid() {
        const products = Object.keys(this.orderRecursiveInfo);
        _.forEach(products, (productId) => {
            this.putProductInBag(productId);
        });
        this.calculationCost();
        this.useBagCounter = {};
        this.orderExpressBagInfo = {};
    }

    // 向serviceId 的 第 number 个包里放productCounter 个 productId这个商品 
    putOneMoreProductInBag(serviceId, productId) {
        // 找到快递服务的对应的具体信息
        const productInfo = this.productInfoMap[productId];
        const serviceInfo = this.servicesInfoMap[serviceId];
        const allSecondTypes = this.servicesInfoMap[serviceId];
        
        _.isEmpty(this.useBagCounter[serviceInfo._id]) ? 
            this.useBagCounter[serviceInfo._id] = [] : '';


        const secondLevelInfo = _.filter(allSecondTypes.item_types, (item) => 
            item.name === this.productInfoMap[productId].type)[0];

        const secondLevelServiceId = secondLevelInfo._id;
        let secondLevelRecorder = this.orderExpressBagInfo[serviceId].secondInfo[secondLevelServiceId];
        let topLevelRecorder = this.orderExpressBagInfo[serviceId].topInfo;
        let allCheckFlag = 6;

        allCheckFlag -= this.putProductInBagLimitChecker(topLevelRecorder, productInfo, serviceInfo);
        allCheckFlag -= this.putProductInBagLimitChecker(secondLevelRecorder, productInfo, secondLevelInfo);

        const canPutFlag = allCheckFlag === 0 ? true : false;
        if (canPutFlag) {
            secondLevelRecorder = this.orderExpressBagInfo[serviceInfo._id].secondInfo[secondLevelServiceId];
            topLevelRecorder = this.orderExpressBagInfo[serviceInfo._id].topInfo;
        }
        topLevelRecorder.weight += productInfo.weight;
        topLevelRecorder.qty++;
        secondLevelRecorder.weight += productInfo.weight;
        return canPutFlag;
    }
    putProductInBagLimitChecker(recorderInfo, productInfo, serviceInfo) {
        const rules = ['weight', 'value', 'qty'];
        const rulesMap = {
            weight: 'max_weight',
            value: 'max_value',
            qty: 'max_qty'
        };
        let matchNumber = 0;
        _.forEach(rules, (key) => {
            recorderInfo[key] + (key === 'qty' ? 1 : productInfo[key]) <= serviceInfo[rulesMap[key]] || !serviceInfo[rulesMap[key]] || !productInfo[key]  ? 
                matchNumber++ : '';
        });
        return matchNumber;
    }
    checkUserNewBagOrOld(serviceId) {
        const topLevelRecorder = this.orderExpressBagInfo[serviceId].topInfo;
        const serviceInfo = this.servicesInfoMap[serviceId];
        let flag = true;
        if (topLevelRecorder.weight !== 0 || (_.isEmpty(topLevelRecorder.weight) && topLevelRecorder.qty < serviceInfo.max_qty)) {
            flag = false;
        }
        return flag;
    }
    putProductInBag(productId) {
        const productRecursiveInfo = this.orderRecursiveInfo[productId]; // 商品对应服务的排列组合信息
        const productDependency = this.productsInfo[productId].dependency; // 商品对应的服务列表
        let serviceDistFlag = true;
        // 把所有商品进行装包
        _.forEach(productRecursiveInfo, (value, index) => {
            if (value === 0) return;
            const serviceInfo = this.servicesInfoMap[productDependency[Number(index - 1)]];
            // init
            if (_.isEmpty(this.orderExpressBagInfo[serviceInfo._id])) {
                this.initOrderExpressBagByServiceId(serviceInfo._id);
            }
            // 判断是否可以满足
            let productCounter = 0;
            let singleBagProductCounter = 0;
            let useNewBag = this.checkUserNewBagOrOld(serviceInfo._id);
            while (productCounter !== value) {
                if (!this.putOneMoreProductInBag(serviceInfo._id, productId)) {
                    if (singleBagProductCounter !== 0) {
                        this.useBagCounter[serviceInfo._id].push({ [productId]: singleBagProductCounter });
                    }
                    useNewBag = true;
                    singleBagProductCounter = 0;
                    this.initOrderExpressBagByServiceId(serviceInfo._id);
                }
                singleBagProductCounter++;
                productCounter++;
            }
            // 如果有分配商品,但是不能顺利装包
            _.isEmpty(this.useBagCounter[serviceInfo._id]) ? 
                this.useBagCounter[serviceInfo._id] = [{[productId]: 
                singleBagProductCounter}] : '';
            if (productCounter !== value && value !== 0) {
                serviceDistFlag = false;
            } else {
                if (singleBagProductCounter !== 0) 
                if (useNewBag) {
                    this.useBagCounter[serviceInfo._id].push({[productId]: singleBagProductCounter});
                } else {
                    const leng = this.useBagCounter[serviceInfo._id].length - 1;
                    this.useBagCounter[serviceInfo._id][leng][productId] = singleBagProductCounter;
                }
            }
        });
    }
    calculationSingleBagCost(expressId, bagInfo) {
        const expressInfo = this.servicesInfoMap[expressId];
        const bags = this.useBagCounter[expressId];
        let minLimitValid = true; // 判断是否满足最小数量限制
        let bagCost = 0;
        bagInfo[expressId] = [];
        _.forEach(bags, (bag) => {
            let min_qty = 0; // 最小数量限制
            let BagWeight = 500;
            let tmp = [];
            for (let productId in bag) {
                min_qty += bag[productId];
                BagWeight += this.productInfoMap[productId].weight * bag[productId];
                tmp.push({
                    _id: productId,
                    name: this.productInfoMap[productId].name,
                    qty: bag[productId],
                });
            }
            // 判断这个包是否满足最小数量限制
            if (expressInfo.min_qty && expressInfo.min_qty > min_qty) {
                minLimitValid = false;
            }
            let BagRate = null;
            // 如果包裹不到min_weight那么最终以一个rate结算
            // 包裹自重500g
            if (BagWeight < expressInfo.min_weight && expressInfo.min_weight) {
                BagRate = Number(expressInfo.rate);
            } else {
                // 如果满足最小重量限制，且包裹存在固定价格
                BagRate = minLimitValid && expressInfo.fixed_rate ? 
                    expressInfo.fixed_rate : 
                    Number((expressInfo.rate * BagWeight / 1000).toFixed(2));
            }
            bagCost += BagRate;
            bagInfo[expressId].push({
                item: tmp,
                weight: BagWeight,
                postage: BagRate,
                service: expressInfo.name
            });
        });
        return { bagCost ,minLimitValid };

    }
    calculationCost() {
        const bagInfo = {};
        let allCost = 0;
        for(let expressId in this.useBagCounter) {
            // if (this.orderRecursiveInfo.p_1000005['2'] === 3 && this.orderRecursiveInfo.p_1000006['2'] === 3) {
            //     console.log(this.orderRecursiveInfo);
            // }
            const { bagCost, minLimitValid } = this.calculationSingleBagCost(expressId, bagInfo);
            
            allCost += bagCost;
            if (!minLimitValid) return;
        }
        if (allCost < this.optimalCost) {
            this.optimalUseBag = bagInfo;
            this.optimalCost = allCost;
        }
        // 如果花费相同，快递种类少，且包裹数量小的方案优先
        let optimalUseBagNumber = 0;
        _.forEach(this.optimalUseBag, (bags) => optimalUseBagNumber += bags.length);
        let tmpUseServiceNumber = 0;
        _.forEach(bagInfo, (bags) => tmpUseServiceNumber += bags.length);
        
        if (allCost === this.optimalCost && tmpUseServiceNumber < optimalUseBagNumber) {
            this.optimalUseBag = bagInfo;
            this.optimalCost = allCost;
        }

        // 速度优先 
        const speedFirstFlag = 'bc';
        let tmp = 0;
        // console.log(this.orderRecursiveInfo, bagInfo);
        
        _.forEach(Object.keys(bagInfo), (expressId) => {
            if (this.servicesInfoMap[expressId].type === speedFirstFlag) {
                tmp += bagInfo[expressId].length;
            }
        });
        if (this.optimalSpeedFirstCounter < tmp) {
            this.optimalSpeedFirst = bagInfo;
            this.optimalSpeedFirstCounter = tmp;
            this.optimalSpeedFirstCost = allCost;
        }
        let optimalSpeedBagNumber = 0;
        _.forEach(this.optimalSpeedFirst, (bags) => optimalSpeedBagNumber += bags.length);
        // 速度相同取费用最小的,并且新的分包方案的总包数量小于等于最优方案
        const weights = {
            speed: 4,
            number: 2,
            value: 1
        };
        let weightsSum = 0;
        if (this.optimalSpeedFirstCounter <= tmp) weightsSum += weights.speed;
        if (optimalSpeedBagNumber >= tmpUseServiceNumber) weightsSum += weights.number;
        if (this.optimalSpeedFirstCost >= allCost) weightsSum += weights.value;
        // console.log(weightsSum, this.orderRecursiveInfo);
        if (_.includes([4, 6, 7], weightsSum)) {
            this.optimalSpeedFirst = bagInfo;
            this.optimalSpeedFirstCounter = tmp;
            this.optimalSpeedFirstCost = allCost;
        }
    }
    initOrderExpressBagByServiceId(serviceId) {
        const initOpt = {
            qty: 0,
            weight: 0,
            value: 0
        };
        // 初始化一级约束的结构
        this.orderExpressBagInfo[serviceId] = {
            topInfo: initOpt, 
            secondInfo: {}
        };
        // 初始化二级约束的结构
        _.forEach(this.services, (service) => {
            if (service._id === serviceId) {
                _.forEach(service.item_types, (item) => {
                    this.orderExpressBagInfo[serviceId].secondInfo[item._id] = initOpt;
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