import {getDatabase, ref, set, get, child, onValue, update, remove, push, equalTo, runTransaction
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { app, auth } from "/auth.js";
import { DateToString, StringToDate, DateToStringTime,
    DateToStringDate } from "/StringTimeHelper.js"

auth.onAuthStateChanged(()=>{
    if(auth.currentUser){
        GetData();
    }
    else $('#data').empty();
});

const db = getDatabase();
const refProj = "projects/testProject01";
const refDramas = "projects/testProject01/dramas";
const dbRef = ref(db, refProj);
var project = [];
// var dramas = [];
var currentSubject = "dramas";
const subjectTypes = ["drama", "character", "key"];
var currentDramaKey = null;

var emptyDrama = {
    type: "drama",
    dramaName: "New Drama",
    dramaOrder: "00",
    dateInStory: "2000-01-01 00:00",
    dialogues:{},
}

var emptyTalk = {
    order: "0",
    type: "talk",
    speaker: "",
    emotion: "",
    displayNameJP: "",
    displayNameTW: "",
    displayNameEN: "",
    speechJP: "",
    speechTW: "",
    speechEN: ""
}

var emptyLabel ={
    order: "0",
    type: "label",
    labelName: ""
}

var emptyKeyJump = {
    order: "0",
    type: "keyJump",
    conditions: {}
}

var emptyKeyJumpCondition ={
    order: "",
    keys: [""],
    targetLabel: ""
}

var testJson2 = {
    projects:{
        projectKey1:{
            type: "project",
            projectName: "projectA",
            dramas:{
                dramaKey01:{
                    type: "drama",
                    dramaOrder: "01",
                    dramaName: "dramaNameA",
                    dateInStory: "2020-01-02",
                    dialogues:{
                        dialogueKey01:{
                            dialogueOrder: "01", 
                            type: "label",
                            labelName: "Label01"
                        },
                        dialogueKey02:{
                            dialogueOrder: "02", 
                            type: "talk",
                            speaker: "Aloner",
                            emotion: "Angry",
                            speech: "Hello, is this Shishiro?"
                        },
                        dialogueKey03:{
                            dialogueOrder: "03", 
                            type: "talk",
                            speaker: "Hsuante",
                            emotion: "Smile",
                            speech: "No, this is Mr. H."
                        },
                        dialogueKey04:{
                            dialogueOrder: "04", 
                            type: "endDrama",
                        }
                    }
                }
            }

        },
        projectKey2:{
            
        },
        projectKey3:{
            
        }
    }
}

var testJson = {
    page1:{
        name: "drama1",
        type: "drama",
        time: "2019-01-01",
        content: "Aloner: Hi.\n\
        Hsuante: Hello."
    },
    page2:{
        name: "drama2",
        type: "drama",
        time: "2019-03-21",
        content: "Aloner: Fuck.\n\
        Hsuante: Damn."
    },
    page3:{
        name: "drama3",
        type: "drama",
        time: "2021-03-03",
        content: "135plus: Miku.\n\
        LittleP: Maki."
    }
}

var dramaKeys = [];

// $(document).ready(function () {});

function GetData(){
    onValue(dbRef, (snapshot) =>{
        if(snapshot.exists()){
            project = snapshot.val();
            DisplayData();
        }else{
            currentDramaKey = null;
            DisplayData();
        }
    });
}

function DisplayData(){
    let dataDiv = $('#data');
    dataDiv.empty();
    
    let subjectsDiv = $('<div>').addClass('subjects');
    subjectsDiv.attr('id', 'subjects');
    let dataContentDiv = $('<dataContent>').addClass('dataContent');
    dataContentDiv.attr('id', 'dataContent');

    let sbjBtnDramas = $('<div>').addClass('subject');
    sbjBtnDramas.attr('id', 'dramas').text('Dramas');
    sbjBtnDramas.click(()=>DisplaySubject('dramas'));
    let sbjBtnCharacters = $('<div>').addClass('subject');
    sbjBtnCharacters.attr('id', 'characters').text('Characters');
    sbjBtnCharacters.click(()=> DisplaySubject('characters'));
    let sbjBtnKeys = $('<div>').addClass('subject');
    sbjBtnKeys.attr('id', 'keys').text('Keys');
    sbjBtnKeys.click(()=>DisplaySubject('keys'));


    subjectsDiv.append([sbjBtnDramas, sbjBtnCharacters, sbjBtnKeys]);

    dataDiv.append([subjectsDiv, dataContentDiv]);


    tmpAddSubjectButton();
    switch(currentSubject){
        case "dramas":
            DisplayDramas();
            break;
        case "characters":
            break;
        case "keys":
            break;
        default:
            break;
    }
    

}

function tmpAddSubjectButton(){
    if($('#selectSubjectType').length > 0){return};
    var subjectsDiv = $('#subjects');
    var selectSubjectType = $('<select>').attr('id', 'selectSubjectType');
    $.each(subjectTypes, function(index, value){
        var $option = $('<option></option>').val(value).text(value);
        selectSubjectType.append($option);
    })
    var addSubBtn = $('<button>');
    addSubBtn.text('Add Subject');
    addSubBtn.click(()=>{
        let newSubject = selectSubjectType.val();
        console.log('newSubject = '+newSubject);
        if(newSubject == "character"){
            let newCharacter = {type: 'character', name: 'John', age: 30};
            let newChaRef = push(ref(db, refProj + '/' + newSubject + 's'));
            set(newChaRef, newCharacter);
        }else if(newSubject == "key"){
            let newKey = {type: 'key', name: 'KeyName'};
            let newChaRef = push(ref(db, refProj + '/' + newSubject + 's'));
            set(newChaRef, newKey);
        }
    });
    subjectsDiv.append([selectSubjectType, addSubBtn]);
}

function DisplaySubject(sbjName){
    currentSubject = sbjName;
    $('.subject').removeClass('selected');
    $('#'+sbjName).addClass('selected');

    var dataContentDiv = $('#dataContent')
    dataContentDiv.empty();

    let subjects = project[sbjName];
    let subjectLength = Object.keys(subjects).length;
    dataContentDiv.text('subjectLength ='+ subjectLength);
    if(subjectLength <= 0){
        dataContentDiv.text(sbjName + '的數量為0');
    }else{
        switch(sbjName){
            case 'dramas':
                DisplayDramas();
                break;
            case 'characters':
                DisplayCharacters();
                break;
            case 'keys':
                DisplayKeys();
                break;
        }
    }


}

function DisplayCharacters(){
    let characters = project.characters;
    let characterContentDiv = $('<div>').addClass('characterContent');
}

function DisplayKeys(){}

function DisplayDramas(){
    currentSubject = "dramas";
    $('.subject').removeClass('selected');
    $('#dramas').addClass('selected');

    let dramas = project.dramas;
    var dataContentDiv = $('#dataContent')
    dataContentDiv.empty();
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dramaContentDiv = $('<div>').addClass('dramaContent');
    dramaContentDiv.attr('id', 'dramaContent');
    dramaKeys = getTypeKeysInJson(dramas, 'drama');
    if(dramaKeys.length != 0){
        let firstKey = 0;
        let pagingDivArray = [];
        dramaKeys.forEach(dramaKey => {
            if(firstKey == 0) firstKey = dramaKey;
            let currentItem = dramas[dramaKey];
            let pagingDiv = $('<div>').addClass('paging');
            let pagingOrder = $('<div>').text(currentItem.dramaOrder).addClass('pagingOrder');
            let pagingContent = $('<div>').html(currentItem.dramaName + '<br>' + currentItem.dateInStory).addClass('pagingContent');
            pagingDiv.append([pagingOrder, pagingContent]);
            pagingDiv.attr({'data-key': dramaKey, 'dramaOrder': currentItem.dramaOrder});
            pagingDiv.click(()=> showDramaContents(pagingDiv));
            pagingDivArray.push(pagingDiv);
        });
        pagingDivArray.sort((divA, divB) => {
            return divA.attr('dramaOrder') - divB.attr('dramaOrder');
        });
        $(sidebarDiv).append(pagingDivArray);
        appendDatas();
        if(currentDramaKey == null) currentDramaKey = firstKey;
        let showPageDiv = $('.paging[data-key="' + currentDramaKey +'"]');
        showDramaContents(showPageDiv);
    }else{
        appendDatas();
        dramaContentDiv.text('no drama now.');
    }

    function appendDatas(){        
        $(sidebarDiv).append(addNewDramaPagingButton());
        $(dataContentDiv).append(sidebarDiv);
        $(dataContentDiv).append(dramaContentDiv);
    }
}

async function showDramaContents(pagingDiv){
    $('.paging').removeClass('selected');
    $(pagingDiv).addClass('selected');
    $('#dramaContent').empty();
    let key = $(pagingDiv).attr('data-key');
    currentDramaKey = key;
    let data = project.dramas[key];
    let dramaOrderRow = $('<div>').addClass('rowParent');
    let dramaOrder = $('<div>').text('Drama Order:').attr('id', 'dramaOrder').addClass('leftTitle');
    let dramaOrderUpButton = $('<button>').text('▲').addClass('left');
    dramaOrderUpButton.click(()=>DramaOrderAdd(-1));
    let dramaOrderDisplay = $('<div>').text(data.dramaOrder).addClass('left');
    let dramaOrderDownButton = $('<button>').text('▼').addClass('left');
    dramaOrderDownButton.click(()=>DramaOrderAdd(1));
    let dramaNameRow = $('<div>').addClass('rowParent');
    let dramaName = $('<div>').text('Drama Name:').attr({class: 'leftTitle'});
    let dramaNameData = $('<div>').text(data.dramaName).addClass('left');
    let dramaNameEdit = $('<input>').attr({ type: 'string',
     value: data.dramaName, class: 'left', id:'dramaNameEdit'});
    let dramaNameButton = $('<button>').text('Modify Drama Name').addClass('left');
    dramaNameButton.click(() => EditDramaName());
    let dataDate = StringToDate(data.dateInStory);
    let strDate = DateToStringDate(dataDate);
    let strTime = DateToStringTime(dataDate);
    let dateInStoryRow = $('<div>').addClass('rowParent');
    let dateInStory = $('<div>').text('Date in Story:').addClass('leftTitle');
    let dateInStoryData = $('<div>').text(data.dateInStory).addClass('left');
    let dateEdit = $('<input>').attr({type: 'date',
     value: strDate, class: 'left', id: 'dateEdit'});
    let timeEdit = $('<input>').attr({type: 'time',
     value: strTime, class: 'left', id: 'timeEdit'})
    let dateEditButton = $('<button>').text('Modify Date in Story').addClass('left');
    dateEditButton.click(() => EditDateInStory());

    let dialogTitle = DOMmaker('div', 'dialogTitle').text('Dialog');
    let dialogDiv = DOMmaker('div', 'dialogDiv', 'dialogDiv');
    let addDialogDiv = DOMmaker('div', 'dialog', 'dialog');
    let addDialogBtn = DOMmaker('button', 'addDialog', 'addDialogBtn');
    addDialogBtn.text('add dialog');
    addDialogBtn.click(()=>addNewDialog(newDialogType.val()));
    // let dialogDiv = $('<div>').addClass('dialogDiv');
    // dialogDiv.attr('id', 'dialogDiv');
    // let addDialogDiv = $('<div>').addClass('addDialogDiv');
    // addDialogDiv.attr('id', 'addDialogDiv');
    let newDialogType = makeDropdownWithStringArray(['talk', 'label', 'keyJump']);
    newDialogType.attr('id', 'newDialogType');
    newDialogType.addClass('addDialog');
    addDialogDiv.append([newDialogType, addDialogBtn, '<hr>']);
    dialogDiv.append([addDialogDiv]);
    
    // let dialogues = "<div>" + data.dialogues.replace(/\n/g, '<br>') + "</div>";
    // let content = dramaName + dateInStory;
    // $('#dramaContent').html(content);
    // $('#dramaContent').append(dramaOrder)
    $('#dramaContent').attr('data-key', key);
    $('#dramaContent').attr('dramaOrder', data.dramaOrder);
    let delButton = $('<button>').text('Delete Drama').addClass('right');
    delButton.click(() => deleteDrama(key));
    // dramaOrderRowLeft.append([dramaOrder, dramaOrderEdit])
    dateInStoryRow.append([dateInStory, dateInStoryData, dateEdit, timeEdit, dateEditButton]);
    dramaOrderRow.append([dramaOrder, dramaOrderUpButton, dramaOrderDisplay, dramaOrderDownButton, delButton]);
    dramaNameRow.append([dramaName, dramaNameData, dramaNameEdit, dramaNameButton]);
    $('#dramaContent').append([dramaOrderRow, dramaNameRow, dateInStoryRow, dialogTitle, dialogDiv]);
    DivsSameWidth([dramaNameData, dateInStoryData]);
}

async function addNewDialog(dialogType){
    let dialogToAdd; 
    switch (dialogType) {
        case "talk":
            dialogToAdd = Object.assign(emptyTalk);
            break;
        case "label":
            dialogToAdd = Object.assign(emptyLabel);
            break;
        case "keyJump":
            dialogToAdd = Object.assign(emptyKeyJump);
            let newCondition = Object.assign(emptyKeyJumpCondition);
            newCondition.order = '1';
            dialogToAdd.conditions = [newCondition];
            break;
        default:
            return;
            break;
    }
    let order = 1;
    let dialogs = project.dramas[currentDramaKey].dialogs;
    if(dialogs === undefined){}
    else if(Object.keys(dialogs).length === 0){}
    else{
        for (let dialogKey in dialogs){
            let dialogOrder = parseInt((dialogs[dialogKey].order), 10); 
            if(dialogOrder >= order)
                order = dialogOrder + 1;
        }
    }
    dialogToAdd.order = order;
    
    let dialogsPath = refDramas + "/" + currentDramaKey + "/dialogs"
    let pushDialog = push(ref(db, dialogsPath));
    set(pushDialog, dialogToAdd);
    // console.log(dialogsLength);
}



// async function UpdateDramas(){
//     let snapshot = await get(dbRef);
//     if(snapshot.exists()){
//         dramas = snapshot.val();
//     }else{
//         console.error('snapshot not exist!')
//     }
// }

//雖然參數是num，但只有正和負的差異，0是正
async function DramaOrderAdd(num){
    let nowOrderString = $('#dramaContent').attr('dramaOrder');
    let nowOrder = parseInt(nowOrderString, 10);
    let nowKey = $('#dramaContent').attr('data-key');

    if(num < 0 && nowOrder <= 1) {
        console.log('Drama Order 不能小於1');
        return;
    } //Drama Order 不能小於1
    let divs = $('.paging[dramaOrder]').toArray();
    divs.sort((a, b)=>{
        let aValue = parseInt(a.getAttribute('dramaOrder'), 10);
        let bValue = parseInt(b.getAttribute('dramaOrder'), 10);
        return aValue - bValue;
    });
    divs.reverse();
    if(num >= 0 && nowOrder >= divs.length){
        console.log('若Drama Order大於或等於目前最大的order值，則不改動order');
        return; //若Drama Order大於或等於目前最大的order值，則不改動order
    }
    
    let datasToSwitch = [];
    divs.forEach(nowDiv =>{
        let nowDivOrder = $(nowDiv).attr('dramaOrder');
        let nowDivKey = $(nowDiv).attr('data-key');
        var pushData = {'order': nowDivOrder, 'dataKey': nowDivKey};
        // console.log('nowDivOrder = '+ nowDivOrder + ', nowOrder = '+nowOrder);
        if(num >= 0){
            if(nowDivOrder > nowOrder) {
                datasToSwitch.push(pushData);
            }
        }
        else{
            if(nowDivOrder < nowOrder){
                datasToSwitch.push(pushData);
            }
        }
    });
    // console.log('datasToSwitch.length = '+datasToSwitch.length);
    if(datasToSwitch.length == 0) {
        console.log('沒有資料的order可替換');
        return; //沒有資料的order可替換
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
    // console.log('dataToSwitchOrder: ' + dataToSwitchOrder);
    if(Math.abs(nowOrder - dataToSwitchOrder) == 1){
        let updateList = [];
        //替換order
        updateList.push({
            dataKey: dataToSwitchKey,
            dataOrder: nowOrder
        });
        updateList.push({
            dataKey: nowKey,
            dataOrder: dataToSwitchOrder
        });
        
        let promises = updateList.map((item)=>{
            let itemRef = ref(db, refDramas + '/' + item.dataKey);
            return runTransaction(itemRef, (currentData) =>{
                if(currentData){
                    currentData.dramaOrder = item.dataOrder;
                    return currentData;
                }else{
                    return;
                }
            });
        });
        try{
            await Promise.all(promises);
        }catch(error){
            console.error(error);
        }

    }else{
        //如果目標Order沒被占用，直接寫入order
        let addAmount = num >= 0 ? 1 : -1;
        update(ref(db, refDramas + '/' + nowKey), {dramaOrder: nowOrder + addAmount});
    }
}

//指定數字來變更Drama Order的方法，有bug，暫不使用。
async function ChangeDramaOrder(previousValue){
    // console.log('previousValue: ' +previousValue + ', order: '+order);
    previousValue = parseInt(previousValue, 10);
    let order = parseInt($('#dramaOrderEdit').val(), 10);
    let key = $('#dramaContent').attr('data-key');
    // await UpdateDramas();
    let orderAndKeys = [];
    for(let dramaKey in dramas){
        let dramaOrder = parseInt(dramas[dramaKey].dramaOrder, 10);
        if(dramaKey == key) continue;
        if(order < previousValue){
            if(dramaOrder < order) continue;
        }else{
            if(dramaOrder < previousValue) continue;
        }
        let orderAndKey = {'key': dramaKey, 'order': dramaOrder};        
        orderAndKeys.push(orderAndKey);
    }
    orderAndKeys.sort((a, b)=>{
        let orderA = parseInt(a.order);
        let orderB = parseInt(b.order);
        return orderA - orderB;
    });
    // console.log('largestOrder:' +orderAndKeys[orderAndKeys.length -1].order);
    orderAndKeys.reverse();
    let largestOrder = parseInt(orderAndKeys[0].order, 10);
    orderAndKeys.reverse();
    let firstSelf = {'key': key, 'order': largestOrder + 1};
    let self = {'key': key, 'order': order};
    let updateList = [];
    updateList.push(self);
    if(order < previousValue){
        for(let i=0; i<orderAndKeys.length; i++){
            let item = orderAndKeys[i];
            let itemOrder = parseInt(item.order, 10);
            if(itemOrder != order + i) continue;
            item.order += 1;
            updateList.push(item);
        }
        updateList.push(firstSelf);
        updateList.reverse();        
    }else{
        for(let i=0; i < orderAndKeys.length; i++){
            let item = orderAndKeys[i];
            let itemOrder = parseInt(item.order, 10);
            if(itemOrder > previousValue + i && itemOrder <= order)
            {
                item.order = previousValue + i;
                updateList.push(item);
            }            
        }
        updateList.push(self);
    }
    let promises = updateList.map((item)=>{
        let itemRef = ref(db, refDramas + '/' + item.key);
        return runTransaction(itemRef, (currentData) =>{
            if(currentData){
                currentData.dramaOrder = item.order;
                return currentData;
            }else{
                return;
            }
        });
    });

    try{
        await Promise.all(promises);
    }catch(error){
        console.error(error);
    }
}

function DivsSameWidth(divs){
    let divWidths = [];
    divs.forEach(div => {divWidths.push(div.width())});
    let maxWidth = Math.max(divWidths);
    divs.forEach(div => {div.width(maxWidth)});
}

function EditDateInStory(){
    let date = $('#dateEdit').val();
    let newDate = $('#dateEdit').val() + " " + $('#timeEdit').val();
    let key = $('#dramaContent').attr('data-key');
    update(ref(db, refDramas + '/' + key), {dateInStory: newDate});
}

function EditDramaName(){
    let newName = $('#dramaNameEdit').val();
    let key = $('#dramaContent').attr('data-key');
    update(ref(db, refDramas + '/' + key), {dramaName: newName});
}

function addNewDramaPagingButton(){
    let pagingDiv = $('<div>').addClass('paging');
    pagingDiv.html('Add new drama');
    pagingDiv.click(()=> addNewDrama() );
    return pagingDiv;
}

async function addNewDrama(){
    let pushRef = push(dbRef);
    let newDrama = await generateEmptyDrama(db, refDramas);
    await set(pushRef, newDrama);
    let snapshot = await get(pushRef);
    currentDramaKey = snapshot.key;
    // let showPageDiv = $('.paging[data-key="' + currentDramaKey +'"]');
    // pagingClickHandler(showPageDiv);
}

async function generateEmptyDrama(db, path) {
    let snapshot = await get(ref(db, path), {
      orderByChild: 'type',
      equalTo: 'drama'
    });
  
    let latestOrder = 0;
    let num = 0;
    let latestDate = null;
    let tmpEmptyDrama = Object.assign({}, emptyDrama);
    let data = snapshot.val();
    if (data) {
      Object.values(data).forEach(item => {
        if (item.dramaName.startsWith(emptyDrama.dramaName)){
            let suffix = item.dramaName.substring(emptyDrama.dramaName.length).trim();
            if (suffix === "")
                num = Math.max(num, 1);
            else {
                let suffixNum = parseInt(suffix, 10);
                if (!isNaN(suffixNum))
                    num = Math.max(num, suffixNum + 1);
            }
        }
        let order = parseInt(item.dramaOrder, 10);
        if(isNaN(order) == false)
            if(order > latestOrder)
                latestOrder = order;

        let date = StringToDate(item.dateInStory);
        if(isNaN(date) == false)
            if(latestDate === null || date > latestDate)
                latestDate = date;
      });
    }
    tmpEmptyDrama.dramaOrder = latestOrder + 1;
    tmpEmptyDrama.dramaName = num === 0 ? emptyDrama.dramaName : `${emptyDrama.dramaName} ${num}`;
    if(latestDate !== null){
        let nextDate = new Date(latestDate);
        nextDate.setDate(latestDate.getDate() + 1);
        tmpEmptyDrama.dateInStory = DateToString(nextDate);
    }  
    return tmpEmptyDrama;
}
async function deleteDrama(key){
    let divs = $('.paging[dramaOrder]');
    let currentDiv = $('.paging[data-key="' + key +'"]');
    let closestDiv = findClosestDiv(divs, currentDiv);
    if(closestDiv != null) {
        showDramaContents(closestDiv);
    }    
    await remove(ref(db, refDramas + "/" + key));
    // await UpdateDramas();
}

//決定當刪除一個drama時，要選取哪一個drama
function findClosestDiv(divs, selfDiv) {
    let closestDiv = null;
    let closestDiff = Infinity;
    let selfKey = $(selfDiv).attr('data-key');
    let selfOrder = parseInt($(selfDiv).attr('dramaOrder'), 10);
  
    divs.each(function() {
        let key = $(this).attr('data-key');
        if(selfKey == key) return;

        let order = parseInt($(this).attr('dramaOrder'));
        let diff = Math.abs(order - selfOrder);

        if (diff < closestDiff || (diff === closestDiff && order < parseInt($(closestDiv).attr('order')))) {
        closestDiv = this;
        closestDiff = diff;
        }
    });  
    return closestDiv;
}

function getTypeKeysInJson(dataObj, targetType){
    let tmpDramaKeys = Object.keys(dataObj).filter(
        key => dataObj[key].type == targetType);
    return tmpDramaKeys;
}

function makeDropdownWithStringArray(array){
    let dropdown = $('<select>');
    for(let i=0; i<array.length; i++){
        let option = $('<option>');
        option.text(array[i]);
        option.val(array[i]);
        dropdown.append(option);
    }
    return dropdown;
}

function DOMmaker(DOMtype, DOMclass, DOMid){
    let dom = $('<' + DOMtype + '>').addClass(DOMclass);
    if(DOMid !== undefined){dom.attr('id', DOMid);}
    return dom;
}