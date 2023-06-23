import{ObjectOrderAdd, getDataByPath, updateObjMaker, batchUpdateDatabase, CheckObject, isObject}from "/DatabaseUtils.js"

export function DisplayListObject(parentObj, objName, objTypes, orderPropName){
    let ListDiv = $('<div>');
    let titleDiv = DisplayTitle(objName, objTypes);
    let objDivs = DisplayObjs(parentObj, objName, objTypes, orderPropName);
}

function DisplayObjs(parentObj, objName, objTypes, orderPropName) {
    let keys = Object.keys(parentObj);
    keys = keys.sort((a, b)=>{
        return parentObj[a][orderPropName] - parentObj[b][orderPropName];
    })
    keys.forEach(key =>{
        let objDiv = $('<div>').addClass('objDiv');
        objDiv.attr('key', key);
        let orderDiv = MakeOrderDiv(key, parentObj);
        let objContentDiv = $('<div>').addClass('objContentDiv');
        let editDiv = MakeEditDiv();
    })
    return undefined;
}

export function MakeOrderDiv(key, parentObj){
    let nowRefPath = '';
    let orderDiv = DOMmaker('div', 'objOrderDiv').attr('key', key);
    let orderUpBtn = DOMmaker('button', 'objOrderButton');
    orderUpBtn.attr('key', key);
    orderUpBtn.addClass('Up');
    orderUpBtn.text('▲');
    $(orderUpBtn).click(()=>{
        ObjectOrderAdd(-1, parentObj[key].order, key, nowRefPath, 'order');
    })
    let orderDownBtn = DOMmaker('button', 'objOrderButton');
    orderDownBtn.attr('key', key);
    orderDownBtn.addClass('Down');
    orderDownBtn.text('▼');
    $(orderDownBtn).click(()=>{
        ObjectOrderAdd(1, parentObj[key].order, key, nowRefPath, 'order');
    })
    let orderTxt = DOMmaker('div', 'objOrderTxt').attr('key', key);
    orderTxt.text(parentObj[key].order);
    orderDiv.append([orderUpBtn, orderTxt, orderDownBtn]);
    return orderDiv;
}

export function DisplayTitle(objName, objTypes) {
    let titleDiv = $('<div>').addClass('listTitleDiv');
    let titleText = $('<div>').addClass('listTitleText');
    titleText.text(objName + 's');
    let titleGrowDiv = $('<div>').addClass('fillSpace');
    titleDiv.append([titleText, titleGrowDiv]);
    if(objTypes !== undefined){
        if(objTypes.length >= 0 ){
            let objTypeSelect = makeDropdownWithStringArray(objTypes);
            objTypeSelect.addClass('listTitleAddObjectSelectType');
            titleDiv.append([objTypeSelect]);
        }
    }
    let titleAddNewObj = $('<button>').addClass('listTitleAddNewObjectButton');
    titleAddNewObj.text(`Add new ${objName}`);
    titleDiv.append([titleAddNewObj]);
    return titleDiv;
}

export function makeDropdownWithStringArray(array){
    let dropdown = $('<select>');
    for(let i=0; i<array.length; i++){
        let option = $('<option>');
        option.text(array[i]);
        option.val(array[i]);
        dropdown.append(option);
    }
    return dropdown;
}

export function DOMmaker(DOMtype, DOMclass, DOMid){
    let dom = $('<' + DOMtype + '>').addClass(DOMclass);
    if(DOMid !== undefined){dom.attr('id', DOMid);}
    return dom;
}

