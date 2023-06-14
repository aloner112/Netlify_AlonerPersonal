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
const dialogTypes = ["talk", "label", "keyJump"];
const languages = ["JP", "EN", "TW", "KR"];
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
    // displayNameJP: "",
    // displayNameTW: "",
    // displayNameEN: "",
    // speechJP: "",
    // speechTW: "",
    // speechEN: ""
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


    // tmpAddSubjectButton();
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
    
    let languageDiv = DOMmaker('div', 'rowParent', 'languageDiv');
    let mainLanguage = $('<div>').text('Main Language:').addClass('left');
    let mainLanguageSelect = makeDropdownWithStringArray(languages).addClass('left');
    mainLanguageSelect.attr('id', 'mainLanguageSelect');
    mainLanguageSelect.change(()=>{
        let all = $('.dialogTalkDivAll');
        let left = $('.dialogTalkDivLeft');
        let mainLang = $('#mainLanguageSelect').val();
        DisplayTalk(left, mainLang);
        DisplayTalk(all, mainLang);
    });
    let showSubLanguage = $('<div>').text('Show Sub Language').addClass('left').addClass('marginLeft');
    let showSubLanguageCheckBox = $('<input>').attr('id', 'showSubLanguageCheckBox').addClass('left');
    showSubLanguageCheckBox.attr('type','checkbox');
    showSubLanguageCheckBox.change(()=> {
        let left = $('.dialogTalkDivLeft');
        let right = $('.dialogTalkDivRight');
        let all = $('.dialogTalkDivAll');
        let mainLang = $('#mainLanguageSelect').val();
        let subLang = $('#subLanguageSelect').val();
        let self = $('#showSubLanguageCheckBox');
        if(self.prop('checked')){
            //show
            left.removeClass('hide');
            DisplayTalk(left, mainLang);
            right.removeClass('hide');
            DisplayTalk(right, subLang);
            all.addClass('hide');
        }else{
            //hide
            all.removeClass('hide');
            DisplayTalk(all, mainLang);
            left.addClass('hide');
            right.addClass('hide');
        }
    });
    let subLanguage = $('<div>').text('Sub Language:').addClass('left').addClass('marginLeft');
    let subLanguageSelect = makeDropdownWithStringArray(languages).addClass('left');
    subLanguageSelect.attr('id', 'subLanguageSelect');
    subLanguageSelect.change(()=>{
        let right = $('.dialogTalkDivRight');
        let subLang = $('#subLanguageSelect').val();
        DisplayTalk(right, subLang);
    });
    languageDiv.append([mainLanguage, mainLanguageSelect, showSubLanguage, showSubLanguageCheckBox, subLanguage, subLanguageSelect]);

    $('#dramaContent').attr('data-key', key);
    $('#dramaContent').attr('dramaOrder', data.dramaOrder);
    let delButton = $('<button>').text('Delete Drama').addClass('right');
    delButton.click(() => deleteDrama(key));
    // dramaOrderRowLeft.append([dramaOrder, dramaOrderEdit])
    dramaOrderRow.append([dramaOrder, dramaOrderUpButton, dramaOrderDisplay, dramaOrderDownButton, delButton]);
    dramaNameRow.append([dramaName, dramaNameData, dramaNameEdit, dramaNameButton]);
    dateInStoryRow.append([dateInStory, dateInStoryData, dateEdit, timeEdit, dateEditButton]);
    $('#dramaContent').append([dramaOrderRow, dramaNameRow, dateInStoryRow,languageDiv]);
    
    //Add Dialog Div
    let dialogTitle = DOMmaker('div', 'dialogTitle');
    let dialogTitleTxt = $('<div>').text('Dialog').addClass('dialogTitleTxt');
    let dialogTitleSpace = $('<div>').addClass('fillSpace');
    let dialogDivContainer = DOMmaker('div', 'dialogDivContainer', 'dialogDivContainer');
    let addDialogDiv = DOMmaker('div', 'addDialogDiv', 'addDialogDiv');
    
    let newDialogType = makeDropdownWithStringArray(dialogTypes);
    newDialogType.attr('id', 'newDialogType');
    newDialogType.addClass('newDialogType');
    let addDialogBtn = DOMmaker('button', 'addDialogBtn', 'addDialogBtn');
    addDialogBtn.text('add dialog');
    addDialogBtn.click(()=> {
        // reorderDatas('dramas', 'dramaOrder');
        // addNewDialog(newDialogType.val());
    });
    // addDialogDiv.append([mainLanguage, mainLanguageSelect, showSubLanguage, showSubLanguageCheckBox, subLanguage, subLanguageSelect]);
    dialogTitle.append([dialogTitleTxt, dialogTitleSpace, newDialogType, addDialogBtn]);
    dialogDivContainer.append([addDialogDiv]);

    //Show Dialogs
    DisplayDialogs(dialogDivContainer);
    // DisplayTalk($('.dialogTalkDivAll'), $('#mainLanguageSelect').val());
    
    // let dialogues = "<div>" + data.dialogues.replace(/\n/g, '<br>') + "</div>";
    // let content = dramaName + dateInStory;
    // $('#dramaContent').html(content);
    // $('#dramaContent').append(dramaOrder)
    $('#dramaContent').append([dialogTitle, dialogDivContainer]);    
    DivsSameWidth([dramaNameData, dateInStoryData]);
}

function DisplayTalk(jQueryDiv, language){
    let key = jQueryDiv.attr('key');
    let talk = project.dramas[currentDramaKey].dialogs[key];
    let talkString = '';
    if(talk == undefined){
        talkString = 'dialogs[' + key + '] is undefined';
        jQueryDiv.html(talkString);
        return;
    }
    let displayName = talk['displayName'+language];
    if(displayName == undefined)
    {
        displayName = "talk['displayName'+"+language+"] is undefined";
    }
    else
    {
        displayName += " tmpDisplayName" + language;
    }
    let speech = talk['speech'+language];
    if(speech == undefined)
    {
        speech = "talk['speech'+"+language+"] is undefined";
    }
    else
    {
        speech += " tmpSpeech" + language;
    }
    talkString = displayName+'<br>'+speech;
    jQueryDiv.html(talkString);
}

function DisplayDialogs(dialogDivContainer) {
    let dialogs = project.dramas[currentDramaKey].dialogs;
    let mainLang = $('#mainLanguageSelect').val();
    if(CheckObject(dialogs) == false){
        dialogDivContainer.text('There is no dialog');
        return;
    }
    let sortedDialogs = Object.entries(dialogs).sort((a, b)=>a.order - b.order);
    sortedDialogs.forEach(([key, dialog])=>{
        let dialogDiv = DOMmaker('div', 'dialog').attr('key', key);
        let orderDiv = DOMmaker('div', 'dialogOrderDiv').attr('key', key);
        let orderUpBtn = DOMmaker('button', 'dialogOrderButton').attr('key', key);
        orderUpBtn.text('▲');
        let orderDownBtn = DOMmaker('button', 'dialogOrderButton').attr('key', key);
        orderDownBtn.text('▼');
        let orderTxt = DOMmaker('div', 'dialogOrderTxt').attr('key', key);
        orderTxt.text(dialog.order);
        orderDiv.append([orderUpBtn, orderTxt, orderDownBtn]);
        dialogDiv.append(orderDiv);
        switch(dialog.type){
            case 'talk':
                let speakerDiv = DOMmaker('div', 'dialogSpeakerDiv').attr('key', key);
                let speakerValue = dialog.speaker == ""? 'no speaker': dialog.speaker;
                let speaker = DOMmaker('div').text(speakerValue);
                speakerDiv.append(speaker);
                let talkDiv = DOMmaker('div', 'dialogTalkDiv').attr('key', key);
                let talkDivAll = DOMmaker('div', 'dialogTalkDivAll').attr('key', key);
                let displayName = dialog['displayName' + mainLang] + 'tmpDisplayName' + mainLang;
                let speech = dialog['speech' + mainLang] + 'tmpSpeech' + mainLang;
                let txt = displayName + '<br>' + speech;
                talkDivAll.html(txt);
                let talkDivLeft = DOMmaker('div', 'dialogTalkDivLeft').attr('key', key);
                talkDivLeft.addClass('hide');
                let talkDivRight = DOMmaker('div', 'dialogTalkDivRight').attr('key', key);
                talkDivRight.addClass('hide');
                talkDiv.append(talkDivAll, talkDivLeft, talkDivRight);
                dialogDiv.append([speakerDiv, talkDiv]);
                break;
            case 'label':
                let labelDiv = DOMmaker('div', 'dialogLabelDiv');
                break;
            case 'keyJump':
                break;
            default:
                return;
        }
        let editDiv = DOMmaker('div', 'dialogEditDiv');
        let delDialogBtn = DOMmaker('button', 'delDialogButton');
        delDialogBtn.attr('key', key);
        delDialogBtn.attr('order', dialog.order);
        delDialogBtn.text('Delete');
        let addDialogBelowSelect = makeDropdownWithStringArray(dialogTypes);
        addDialogBelowSelect.addClass('addDialogBelowSelect');
        addDialogBelowSelect.attr('key', key);
        let addDialogBelowBtn = DOMmaker('button', 'addDialogBelowBtn');
        addDialogBelowBtn.attr('key', key);
        addDialogBelowBtn.attr('order', dialog.order);
        addDialogBelowBtn.text('▼ Add Dialog');
        // let delDialogDiv = DOMmaker('div', 'delDialogDiv');
        // delDialogDiv.append(delDialogBtn);
        
        editDiv.append([delDialogBtn, '<hr>', addDialogBelowSelect,'<br>', addDialogBelowBtn]);

        dialogDiv.append([editDiv]);
        dialogDivContainer.append(dialogDiv);
        
        
        let speakerDiv = DOMmaker('div', 'speakerDiv');
        let speechDiv = DOMmaker('div', 'speechDiv');
        
    })
}


async function addNewDialog(dialogType){
    let dialogToAdd; 
    switch (dialogType) {
        case "talk":
            dialogToAdd = Object.assign({}, emptyTalk);
            languages.forEach(language =>{
                let displayNameProp = 'displayName' + language;
                let speechProp = 'speech' + language;
                dialogToAdd[displayNameProp] = 'KR';
                dialogToAdd[speechProp] = 'KR';
            })
            break;
        case "label":
            dialogToAdd = Object.assign({}, emptyLabel);
            break;
        case "keyJump":
            dialogToAdd = Object.assign({}, emptyKeyJump);
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
    if(CheckObject(dialogs) == false){}
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

function CheckObject(obj){
    if(obj === undefined){return false;}
    else if(Object.keys(obj).length === 0){return false;}
    else {return true;}
}


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
        let updateList1 = {dramaOrder: nowOrder};
        let updateList2 = {dramaOrder: dataToSwitchOrder};
        updateList.push({
            refPath: refDramas + '/' + dataToSwitchKey,
            updateList: updateList1
        });
        updateList.push({
            refPath: refDramas + '/' + nowKey,
            updateList: updateList2
        });

        batchUpdateDatabase(updateList);
        
    }else{
        //如果目標Order沒被占用，直接寫入order
        let addAmount = num >= 0 ? 1 : -1;
        update(ref(db, refDramas + '/' + nowKey), {dramaOrder: nowOrder + addAmount});
    }
}

async function batchUpdateDatabase(updateObjs){
    //updateObjs為一個Array，
    //每個內容成員有兩個物件，一個是refPath，以string紀載路徑
    //另一個是updateList，這是一個物件，紀載要更新的key以及內容
    
    let promises = updateObjs.map(item =>{
        if(CheckObject(item.refPath) != true){
            console.log('there is no refPath');
            return;
        }
        if(isObject(item.updateList) == false){
            console.log('item.updateList is not a object');
            return;
        }
        let itemRef = ref(db, item.refPath);
        let updateList = item.updateList;
        return runTransaction(itemRef, (currentData)=>{
            if(currentData){
                for(let key in updateList){
                    currentData[key] = updateList[key];
                }
                return currentData;
            }else{
                return;
            }
        })
    })
    try{
        await Promise.all(promises);
    }catch(error){
        console.error(error);
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
    let pushRef = push(ref(db, refDramas));
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
        currentDramaKey = $(closestDiv).attr('data-key');
    }
    await remove(ref(db, refDramas + "/" + key));
    reorderDatas('dramas', 'dramaOrder');
}

function reorderDatas(refPath, orderPropName){
    let parentObj = getDataByPath(refPath);
    if(isObject(parentObj) == false) {
        return;
    }
    let logStr = '';
    let objArray = [];
    for(let key in parentObj){
        let orderObj = {
            [orderPropName]: parentObj[key][orderPropName]
        };
        let obj = {
            refPath: refProj +'/'+ refPath + '/' + key,
            updateList: {orderObj}          
        };
        objArray.push(obj);
        // logStr += 'key = ' + key + ', order = ' + parentObj[key][orderPropName] + '\n';
    }
    objArray.sort((a, b)=>a['updateList'][orderPropName] - b['updateList'][orderPropName]);
    let modifyList = [];
    for(let i = 0; i < objArray.length; i++){
        let nowObj = objArray[i];
        let expectedOrder = i+1;
        if(nowObj['updateList'][orderPropName] != expectedOrder){
            nowObj['updateList'][orderPropName] = expectedOrder;
            modifyList.push(nowObj);
        }        
    }
    batchUpdateDatabase(modifyList);
    // console.log(objArray);
}

function isObject(target){
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

function getDataByPath(refPath){
    //refPath不用寫'projects/testProject01/'
    let pathParts = refPath.split('/');
    return pathParts.reduce((obj, part)=> obj[part], project);
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