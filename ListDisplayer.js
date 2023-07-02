import{ObjectOrderAdd, getDataByPath, updateObjMaker, batchUpdateDatabase,
    CheckObject, isObject, deleteDataWithOrder}from "/DatabaseUtils.js"

export function DisplayListObject(parentPath, objName, orderPropName, projectObject, objTypes ){
    // let listDiv = $('<div>').addClass('listDivContainer');
    let titleDiv = DisplayTitle(objName, objTypes);
    let objDivs = DisplayObjs(parentPath, objName, orderPropName, projectObject, objTypes);
    // listDiv.append([titleDiv, objDivs]);
    return [titleDiv, objDivs];
}

function DisplayObjs(parentPath, objName, orderPropName, projectObject, objTypes) {
    let parentObj = getDataByPath(parentPath, projectObject);
    let keys = Object.keys(parentObj);
    keys = keys.sort((a, b)=>{
        return parentObj[a][orderPropName] - parentObj[b][orderPropName];
    })
    
    let objDivContainer = $('<div>').addClass('objDivContainer');
    keys.forEach(key =>{
        let objDiv = $('<div>').addClass('objDiv');
        objDiv.attr('key', key);
        let orderDiv = MakeOrderDiv();
        let objContentDiv = $('<div>').addClass('objContentDiv');
        let editDiv = MakeEditDiv(key, objName, objTypes);
        objDiv.append([orderDiv, objContentDiv, editDiv]);
        objDivContainer.append(objDiv);
    })
    return objDivContainer;
}

export function MakeOrderDiv(){
    // let parentPath = 'keys';
    let orderDiv = DOMmaker('div', 'objOrderDiv');
    let orderUpBtn = DOMmaker('button', 'objOrderButton');
    // orderUpBtn.attr('key', key);
    orderUpBtn.addClass('up');
    orderUpBtn.text('▲');
    // $(orderUpBtn).click(()=>{
    //     ObjectOrderAdd(-1, parentObj[key].order, key, parentPath, orderPropName,
    //         database, projectPath, projectObject);
    // })
    let orderDownBtn = DOMmaker('button', 'objOrderButton');
    // orderDownBtn.attr('key', key);
    orderDownBtn.addClass('down');
    orderDownBtn.text('▼');
    // $(orderDownBtn).click(()=>{
    //     ObjectOrderAdd(1, parentObj[key].order, key, parentPath, orderPropName,
    //         database, projectPath, projectObject);
    // })
    let orderTxt = DOMmaker('div', 'objOrderTxt');
    // orderTxt.text(parentObj[key].order);
    orderTxt.text('0');
    orderDiv.append([orderUpBtn, orderTxt, orderDownBtn]);
    return orderDiv;
}

export function MakeEditDiv(key, objName, objTypes){
    let editDiv = DOMmaker('div', 'objEditDiv');
    // editDiv.attr('key', key);
    let objEditBtn = DOMmaker('button', 'objEditButton');
    objEditBtn.text('Edit');
    let objCancelEditBtn = DOMmaker('button', 'objCancelEditButton');
    objCancelEditBtn.text('Cancel');
    let objSubmitBtn = DOMmaker('button', 'objSubmitButton');
    objSubmitBtn.text('Submit');
    let objDelBtn = DOMmaker('button', 'objDelButton');
    objDelBtn.text('Delete');
    editDiv.append([objEditBtn, objSubmitBtn, objCancelEditBtn, objDelBtn]);
    if(objTypes !== undefined){
        if(objTypes.length > 0){
            let addDialogBelowSelect = makeDropdownWithStringArray(objTypes);
            addDialogBelowSelect.addClass('objAddBelowSelect');
            editDiv.append(addDialogBelowSelect);
        }
    }
    let objAddBelowBtn = DOMmaker('button', 'objAddBelowBtn');
    objAddBelowBtn.text('▼ Add ' + objName);
    editDiv.append([objAddBelowBtn]);
    return editDiv;
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

