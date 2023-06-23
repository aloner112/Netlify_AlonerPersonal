export function DisplayListObject(parentObj, listName, objTypes){
    let ListDiv = $('<div>');
    DisplayTitle(listName, objTypes);
}

export function DisplayTitle(listName, objTypes) {
    let titleDiv = $('<div>').addClass('listTitleDiv');
    let titleText = $('<div>').addClass('listTitleText');
    titleText.text(listName + 's');
    let titleGrowDiv = $('<div>').addClass('listTitleGrow');
    titleDiv.append([titleText, titleGrowDiv]);
    if(objTypes !== undefined){
        if(objTypes.length >= 0 ){
            let objTypeSelect = makeDropdownWithStringArray(objTypes);
            objTypeSelect.addClass('listTitleAddObjectSelectType');
            titleDiv.append([objTypeSelect]);
        }
    }
    let titleAddNewObj = $('<button>').addClass('listTitleAddNewObjectButton');
    titleAddNewObj.text(`Add new ${listName}`);
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