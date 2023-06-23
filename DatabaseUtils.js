import {ref, runTransaction, update} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

//雖然參數是num，但只有正和負的差異，0是正
export async function ObjectOrderAdd(num, nowOrderString, nowKey, parentPath,
                                     orderPropName, database, projectPath, projectObject){
    let nowOrder = parseInt(nowOrderString, 10);
    if(num < 0 && nowOrder <= 1) {
        console.log('Drama Order 不能小於1');
        return;
    }
    let objs = getDataByPath(parentPath, projectObject);
    let objKeys = Object.keys(objs);
    objKeys.sort((a, b)=> {
        let aOrder = parseInt(objs[a][orderPropName], 10);
        let bOrder = parseInt(objs[b][orderPropName], 10);
        return aOrder - bOrder;
    })
    objKeys.reverse();

    if(num >= 0 && nowOrder >= objKeys.length){
        console.log('若Drama Order大於或等於目前最大的order值，則不改動order');
        return;
    }

    let datasToSwitch = [];
    objKeys.forEach(nowObjKey =>{
        let nowObjOrder = parseInt(objs[nowObjKey][orderPropName], 10);
        let pushData = {'order': nowObjOrder, 'dataKey': nowObjKey};
        if(num >= 0){
            if(nowObjOrder > nowOrder) {
                datasToSwitch.push(pushData);
            }
        }
        else{
            if(nowObjOrder < nowOrder){
                datasToSwitch.push(pushData);
            }
        }
    });
    if(datasToSwitch.length === 0) {
        console.log('沒有資料的order可替換');
        return;
    }
    datasToSwitch.sort((a, b)=>{
        let aValue = parseInt(a.order, 10);
        let bValue = parseInt(b.order, 10);
        return aValue - bValue;
    });
    if(num < 0){
        datasToSwitch.reverse();
    }
    let dataToSwitchKey = datasToSwitch[0].dataKey;
    let dataToSwitchOrder = parseInt(datasToSwitch[0].order);
    if(Math.abs(nowOrder - dataToSwitchOrder) === 1){
        let updateList = [];
        //替換order
        let updateList1 = {[orderPropName]: nowOrder};
        let updateList2 = {[orderPropName]: dataToSwitchOrder};
        updateList.push(updateObjMaker(dataToSwitchKey, parentPath, updateList1, projectPath));
        updateList.push(updateObjMaker(nowKey, parentPath, updateList2, projectPath));

        let promises = await batchUpdateDatabase(updateList, database);

        try{
            await Promise.all(promises);
        }catch(error){
            console.error(error);
        }

    }else{
        //如果目標Order沒被占用，直接寫入order
        let addAmount = num >= 0 ? 1 : -1;
        update(ref(database, projectPath +'/' +parentPath + '/' + nowKey), {[orderPropName]: nowOrder + addAmount});
    }
}

export function updateObjMaker(key, parentPath, objValues, projectPath){
    return {
        refPath: projectPath + '/' + parentPath + '/' + key,
        updateList: objValues
    };
}

export function getDataByPath(refPath, projectObject){
    //refPath不用寫'projects/testProject01/'
    let pathParts = refPath.split('/');
    return pathParts.reduce((obj, part)=> obj[part], projectObject);
}

//updateObjs為一個Array，
//每個內容成員有兩個物件，一個是refPath，以string紀載路徑
//另一個是updateList，這是一個物件，紀載要更新的key以及內容
export async function batchUpdateDatabase(updateObjs, database){

    return updateObjs.map(item => {
        if (CheckObject(item.refPath) !== true) {
            throw new Error('there is no refPath');
        }
        if (isObject(item.updateList) === false) {
            throw new Error('item.updateList is not a object');
        }
        let itemRef = ref(database, item.refPath);
        let updateList = item.updateList;
        return runTransaction(itemRef, (currentData) => {
            if (currentData) {
                for (let key in updateList) {
                    currentData[key] = updateList[key];
                }
                return currentData;
            } else {
                throw new Error('Current data does not exist');
            }
        })
    });
}


export function CheckObject(obj){
    if(obj === undefined){return false;}
    else if(Object.keys(obj).length === 0){return false;}
    else {return true;}
}


export function isObject(target){
    if(target === undefined){
        console.log('refPath is undefined');
        return false;
    }
    if(typeof target !== 'object' ){
        console.log('refPath is not a object');
        return false;
    }
    if(target === null){
        console.log('refPath is null');
        return false;
    }
    return true;
}