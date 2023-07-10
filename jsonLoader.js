import {getDatabase, ref, set, get, child, onValue, update, remove, push, equalTo, runTransaction
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import {getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";
import { app, auth } from "/auth.js";
import { DateToString, StringToDate, DateToStringTime,
    DateToStringDate } from "/StringTimeHelper.js"
import{DisplayListObject, DisplayTitle, makeDropdownWithStringArray, DOMmaker, MakeEditDiv, MakeOrderDiv} from "/ListDisplayer.js";
import{ObjectOrderAdd, getDataByPath, updateObjMaker, batchUpdateDatabase, CheckObject,
    isObject, orderObjectKeysByProp, deleteDataWithOrder}from "/DatabaseUtils.js"

auth.onAuthStateChanged(()=>{
    if(auth.currentUser){
        GetData();
    }
    else $('#data').empty();
});

const db = getDatabase();
const storage = getStorage();
const projectName = 'testProject01';
const refProj = `projects/${projectName}`;
// const refProj = "projects/testProject01";
const refDramas = "dramas";
const dbRef = ref(db, refProj);
var project = [];
// var dramas = [];
var currentSubject = "dramas";
const subjectTypes = ["drama", "character", "key"];
const dialogTypes = ["talk", "label", "keyJump"];
const languages = ["JP", "EN", "TW", "KR"];
var nowDramaLanguages = [];
var currentDramaKey = null;
var nowShowingSubLanguage = false;

var emptyDrama = {
    type: "drama",
    dramaName: "New Drama",
    dramaOrder: "00",
    dateInStory: "2000-01-01 00:00",
    dialogues:{},
}

var emptyKey = {
    type: "key",
    name: "Empty Key",
    order: 1,
    description: "no description"
}

var emptyCharacter ={
    order: 0,
    type: "character",
    name: "new character",
    description: "no description",
    phiz:{}
}

var emptyPhiz = {
    order: 0,
    name: "name",
    link: ""
}

var PhizList = ['normal', 'smile', 'laugh', 'angry', 'serious', 'sad', 'worry', 'hate'];

var emptyTalk = {
    order: "0",
    type: "talk",
    speaker: "",
    emotion: ""
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

var dramaKeys = [];

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

    if(subjectTypes.includes(currentSubject.substring(0, currentSubject.length - 1))){
        DisplaySubject(currentSubject);
    }else{
        console.error(`沒有這種Subject: ${currentSubject}`);
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
        if(newSubject === "character"){
            let newCharacter = {type: 'character', name: 'John', age: 30};
            let newChaRef = push(ref(db, refProj + '/' + newSubject + 's'));
            set(newChaRef, newCharacter);
        }else if(newSubject === "key"){
            let newKey = {type: 'key', name: 'KeyName'};
            let newChaRef = push(ref(db, refProj + '/' + newSubject + 's'));
            set(newChaRef, newKey);
        }
    });
    subjectsDiv.append([selectSubjectType, addSubBtn]);
}

function pushNewObject(parentRef, obj){
    return set(push(ref(db, refProj + '/' + parentRef)), obj);
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
    // let characters = project.characters;
    // let characterContentDiv = $('<div>').addClass('characterContent');
    let dataContent = $('#dataContent');
    dataContent.empty();
    let listDivContainer = DOMmaker('div', 'listDivContainer');
    
    let parentRef = 'characters';
    let objName = 'character';
    let phizFolderName = 'phiz';
    let orderProp = 'order';
    let parentObj = project[parentRef];
    let keys = orderObjectKeysByProp(parentObj, orderProp);
    
    let characterItemName = 'character';
    let LangNameItemName = 'LangName';
    
    let langDiv = DOMmaker('div').css({
        'display': 'flex'
    });
    let langTxt = DOMmaker('div').text('Language:');
    langTxt.css('margin-right', '10px');
    let langSelect = makeDropdownWithStringArray(languages);
    langSelect.attr('id', 'mainLanguageSelect');
    if(typeof nowDramaLanguages[0] === 'string'){
        langSelect.val(nowDramaLanguages[0]);
    }else{
        nowDramaLanguages[0] = languages[0];
        langSelect.val(languages[0]);
    }
    langSelect.change(()=>{
        let objDivs = $('.objDiv');
        let mainLang = $('#mainLanguageSelect').val();
        let langNameKey = `name${mainLang}`;

        objDivs.toArray().forEach(element=>{
            let objDiv = $(element);
            let key = objDiv.attr('key');
            let langNameTitle = objDiv.find(`.txtInputTitle.${LangNameItemName}`);
            // let langNameTitle = objDiv.find(`.txtInputTitle.Language`);
            langNameTitle.text('Language ' +langNameKey + ':');
            let langNameTxt = objDiv.find(`.objTxt.${LangNameItemName}`);
            // let langNameTxt = objDiv.find(`.objTxt.Language`);
            let langName = project[parentRef][key][langNameKey];
            langName = decodeURIComponent(langName);
            langNameTxt.html(langName);
            let langNameInput = objDiv.find(`.txtInput.${LangNameItemName}`);
            // let langNameInput = objDiv.find(`.txtInput.Language`);
            langNameInput.attr('valueKey', langNameKey);
            langNameInput.val(langName);
        });
       
        nowDramaLanguages[0] = mainLang;
    });
    langDiv.append(langTxt, langSelect);
    listDivContainer.append(langDiv);
    let characterList = DisplayListObject(parentRef, objName, orderProp, project);
    
    listDivContainer.append(characterList);
    // let titleDiv = DisplayTitle(objName);
    // listDivContainer.append([characterList]);
    dataContent.append([listDivContainer]);
    
    keys.forEach(key =>{
        let obj = parentObj[key];
        let characterName = obj.name;
        
        setOrderDiv(key, parentRef, orderProp, obj);
        setEditDiv(key, parentRef, orderProp, obj);
        
        let objDiv = $(`.objDiv[key=${key}]`);
        objDiv.css({
            'display':'grid', 
            'grid-template-columns':'30px 150px 200px calc( 100vw - 730px) 200px'
            // 'grid-template-columns':'30px 150px 200px calc( 100vw - 580px) 200px'
        });
        let editDiv = objDiv.find('.objEditDiv');
        editDiv.css({
            'grid-column': '5 / 6',
            'display':'grid',
            'grid-template-rows':'5px 30px 30px 30px 30px 5px'
        });
        let editBtn = objDiv.find('.objEditButton');
        editBtn.css({
            'box-sizing':'content-box',
            'grid-column': '2/6',
            'grid-row':'2'
        });
        let delBtn = objDiv.find('.objDelButton');
        delBtn.css({
            'background-color':'red',
            'box-sizing':'content-box',
            'grid-column': '2/6',
            'grid-row':'4'
        });
        let objSubmitBtn = objDiv.find('.objSubmitButton');
        objSubmitBtn.css({
            'box-sizing':'content-box',
            'grid-column': '2/6',
            'grid-row':'3'
        });
        let cancelBtn = objDiv.find('.objCancelEditButton');
        cancelBtn.css({
            'box-sizing':'content-box',
            'grid-column': '2/6',
            'grid-row':'2'
        });
        let addBelowBtn = objDiv.find('.objAddBelowBtn');
        addBelowBtn.css({
            'box-sizing':'content-box',
            'grid-column': '2/6',
            'grid-row':'5 / 6'
        });
        let objContentDiv = objDiv.find('.objContentDiv');
        objContentDiv.css({
            'grid-column': '2 / 5'
        });
        
        let characterDiv = DOMmaker('div', 'characterDiv');
        characterDiv.css({
            'width':'150px',
            'min-width':'150px',
            'background-color':'#dddddd',
            'grid-column': '1 / 2'
        })
        
        let characterField = makeEditableTxtField(obj, characterItemName, 'name', 'input');
        let langNameKey = `name${nowDramaLanguages[0]}`;
        let langNameField = makeEditableTxtField(obj, LangNameItemName, langNameKey, 'input');
        characterDiv.append(characterField, langNameField);

        //new phiz div
        let newPhizDiv = DOMmaker('div', 'newPhizDiv');
        newPhizDiv.css({
            'grid-column': '2 / 3'
        })
        let imgPreview = DOMmaker('img', 'imgPreview');
        imgPreview.attr('characterKey', key);
        imgPreview.css({
            'display': 'block',
            'max-width': '200px',
            'max-height': '200px'
        });
        let imgInput = $('<input>').attr('type', 'file').attr('id', 'uploadImg');
        imgInput.addClass('uploadImg');
        imgInput.css({
            'display': 'block',
            'max-width': '200px',
        });
        imgInput.on('input', function () {
            let imgFile = this.files[0];
            if (!imgFile) {
                return;
            }
            let fileReader = new FileReader();
            let parentDiv = $(`.objDiv[key=${key}]`);
            fileReader.onload = function (e) {
                let imgPrev = parentDiv.find('.imgPreview');
                // let imgPrev = $(`.imgPreview[characterKey=${key}]`);
                imgPrev.attr('src', e.target.result);
            }
            fileReader.readAsDataURL(imgFile);
            checkNewPhiz(key);
            // let addButton = parentDiv.find('.uploadNewPhizImgBtn');
            // addButton.prop('disabled', false);
        });
        let phizNameTitle = DOMmaker('div', 'txtInputTitle');
        phizNameTitle.text('Phiz Name:');
        let newPhizNameInput = DOMmaker('input', 'newPhizNameInput');
        newPhizNameInput.attr('placeholder', 'enter phiz name');
        newPhizNameInput.on('input', function(){
            checkNewPhiz(key);
            // let value = $(this).val();
            // let phizKeys = orderObjectKeysByProp(obj[phizFolderName], orderProp);
            // if(phizKeys === []){
            //     return;}
            // let phizNames = [];
            // phizKeys.forEach(phizKey =>{
            //     phizNames.push(obj[phizFolderName][phizKey]['name']);
            // });
            // console.log(`phizNames: ${phizNames}`);
            // let newPhizErrorText = $(`.objDiv[key=${key}]`).find('.txtPhizError');
            // if(phizNames.includes(value)){
            //     newPhizErrorText.css('display', 'block')
            //     newPhizErrorText.text(`phiz name '${value}' already exist`);
            // }else{
            //     if(value !== ''){
            //         newPhizErrorText.css('display', 'none');
            //         newPhizErrorText.text('');
            //     }else{
            //         newPhizErrorText.css('display', 'block');
            //         newPhizErrorText.text('phiz name empty');
            //     }
            // }
        });
        function checkNewPhizName(characterKey){
            let objDiv = $(`.objDiv[key=${characterKey}]`);
            let value = objDiv.find('.newPhizNameInput').val();
            let phizKeys = orderObjectKeysByProp(obj[phizFolderName], orderProp);
            if(phizKeys === []){
                return '';}
            let phizNames = [];
            phizKeys.forEach(phizKey =>{
                phizNames.push(obj[phizFolderName][phizKey]['name']);
            });
            console.log(`value: ${value}`);
            // let newPhizErrorText = objDiv.find('.txtPhizError');
            if(phizNames.includes(value)){
                // newPhizErrorText.css('display', 'block')
                // newPhizErrorText.text(`phiz name '${value}' already exist`);
                return `phiz name '${value}' already exist`;
            }else{
                if(value !== ''){
                    // newPhizErrorText.css('display', 'none');
                    // newPhizErrorText.text('');
                    return '';
                }else{
                    // newPhizErrorText.css('display', 'block');
                    // newPhizErrorText.text('phiz name empty');
                    return 'phiz name empty';
                }
            }
        }
        function checkNewPhizImg(characterKey){
            let objDiv = $(`.objDiv[key=${characterKey}]`);
            let imgInput = objDiv.find('#uploadImg')[0];
            let file = imgInput.files[0];
            if(!file){
                return 'no file selected';
            }
            return '';
        }
        function checkNewPhiz(characterKey){
            let objDiv = $(`.objDiv[key=${characterKey}]`);
            let txtErr = objDiv.find('.txtPhizError');
            let addBtn = objDiv.find('.uploadNewPhizImgBtn');
            addBtn.prop('disabled', true);
            let checkName = checkNewPhizName(characterKey);
            let checkImg = checkNewPhizImg(characterKey);
            txtErr.css({
                'color':'red',
                'display':'block'
            });
            if(checkImg === ''){
                if(checkName === ''){
                    txtErr.css('display', 'none');
                    txtErr.text= '';
                    addBtn.prop('disabled', false);
                }else{
                    txtErr.text(checkName);
                }
            }else{
                if(checkName === ''){
                    txtErr.text(checkImg);
                }else{
                    txtErr.html(checkImg + '<br>' + checkName);
                }
            }
            
        }
        
        
        let newPhizErrorText = DOMmaker('div', 'txtPhizError');
        newPhizErrorText.css({
            'color':'red',
            'display':'block'
        });
        newPhizErrorText.text('phiz name empty');
        let addNewPhizBtn = DOMmaker('button', 'uploadNewPhizImgBtn');
        addNewPhizBtn.prop('disabled', true);
        addNewPhizBtn.css({
            'display': 'block',
            'margin-left': '25px',
            'width': '150px'
        });
        addNewPhizBtn.text('Add New Phiz');
        addNewPhizBtn.click(async function () {
            function getFileExtension(fileName) {
                return fileName.split('.').pop();
            }

            let parentDiv = $(`.objDiv[key=${key}]`);
            let fileInput = parentDiv.find('.uploadImg');
            console.log(`fileInput is undefined? ${fileInput === undefined}`);
            let newPhizName = parentDiv.find('.newPhizNameInput').val();
            newPhizName = encodeURIComponent(newPhizName);
            let imgFile = fileInput.prop('files')[0];
            let imgExt = getFileExtension(imgFile.name);
            let imgPath = `${refProj}/${parentRef}/${characterName}/${phizFolderName}/${newPhizName}.${imgExt}`;
            let imgRef = storageRef(storage, imgPath);
            await uploadBytes(imgRef, imgFile);
            let imgURL = await getDownloadURL(imgRef);
            console.log(`imgURL = ${imgURL}`);
            let phizObj = {
                name: newPhizName,
                url: imgURL
            }
            let phizRef = `${parentRef}/${key}/${phizFolderName}`;
            await addDataWithOrder(phizObj, phizRef, orderProp);
        })
        newPhizDiv.append([imgPreview, imgInput, phizNameTitle, newPhizNameInput, newPhizErrorText, addNewPhizBtn]);
        
        //phiz list
        let phizListDiv = DOMmaker('div', 'phizListDiv');
        phizListDiv.css({
            'flex-grow':'1',
            'overflow-x':'scroll'
        })
        let phizListInnerDiv = DOMmaker('div', 'phizListInnerDiv');
        phizListInnerDiv.css({
            'display':'flex',
            'flex-direction':'row'
        });

        let phizKeys = orderObjectKeysByProp(obj[phizFolderName], orderProp);
        phizKeys.forEach(phizKey =>{
            let phizDiv = DOMmaker('div', 'phizDiv');
            phizDiv.css({
                'display':'block'
            });
            let phizObj = obj[phizFolderName][phizKey];
            
            let phizOrderDiv = DOMmaker('div', 'phizOrderDiv');
            phizOrderDiv.css({
                'display':'grid',
                'grid-template-columns':'1fr 30px 2px 30px 2px 30px 1fr'
            });
            let phizOrderBtnL = DOMmaker('button', 'phizOrderBtnL');
            phizOrderBtnL.css({
                'grid-column': '2 / 3'
            });
            phizOrderBtnL.text('◀');
            let phizOrderTxt = DOMmaker('div', 'phizOrderTxt');
            phizOrderTxt.css({
                'grid-column': '4 / 5'
            });
            phizOrderTxt.text(phizObj[orderProp]);
            let phizOrderBtnR = DOMmaker('button', 'phizOrderBtnR');
            phizOrderBtnR.css({
                'grid-column': '6 / 7'
            });
            phizOrderBtnR.text('▶');
            phizOrderDiv.append([phizOrderBtnL, phizOrderTxt, phizOrderBtnR]);
            
            let phizImg = $('<img>').attr('src', phizObj.url);
            phizImg.css({
                'max-width':'200px',
                'max-height':'200px'
            });
            let phizName = DOMmaker('div', 'phizName');
            phizName.text(decodeURIComponent(phizObj.name));

            phizDiv.append([phizOrderDiv, phizImg, phizName]);
            phizListInnerDiv.append(phizDiv);
        });
        phizListDiv.append(phizListInnerDiv);
        objContentDiv.append([characterDiv, newPhizDiv, phizListDiv]);
    });
    
    
   
}

function DisplayKeys(){
    var dataContentDiv = $('#dataContent');
    dataContentDiv.empty();
    
    let parentPath = 'keys';
    let orderPropName = 'order';
    let parentObj = project[parentPath];
    
    // let keysDivContainer = 
    let keyListElements = DisplayListObject(parentPath, 'key',
        orderPropName, project);
    let keysDivContainer = $('<div>').addClass('listDivContainer');
    keysDivContainer.append(keyListElements);
    dataContentDiv.append(keysDivContainer);
    
    let titleAddKeyBtn = keysDivContainer.find('.listTitleAddNewObjectButton');
    titleAddKeyBtn.click(async function(){
        await addDataWithOrder(emptyKey, parentPath, orderPropName);
    })
    let keys = orderObjectKeysByProp(parentObj, orderPropName);
    keys.forEach(key=>{
        let obj = parentObj[key];
        let objDiv = $(`.objDiv[key=${key}]`);
        
        //orderDiv
        setOrderDiv(key, parentPath, orderPropName, obj);

        //contentDiv
        let contentDiv = objDiv.find('.objContentDiv');
        let objNameDiv = DOMmaker('div', 'objMediumDiv');
        let objNameField = makeEditableTxtField(obj, 'key', 'name', 'input');
        objNameDiv.append(objNameField);
        
        let usageDiv = DOMmaker('div', 'objMediumDiv');
        let usageTitle = DOMmaker('div', 'txtInputTitle');
        usageTitle.text('Usage:');
        let usageTxt = DOMmaker('div');
        usageTxt.text('開發中');
        usageDiv.append([usageTitle, usageTxt]);
        
        let objDescriptionDiv = DOMmaker('div', 'objDescriptionDiv');
        let objDescriptionField = makeEditableTxtField(obj, 'key', 'description', 'textarea');
        objDescriptionDiv.append(objDescriptionField);
        
        contentDiv.append([objNameDiv, usageDiv, objDescriptionDiv]);
        
        //editDiv
        setEditDiv(key, parentPath, orderPropName, obj);
    });
}

function setEditDiv(key, parentPath, orderPropName, obj) {
    let objDiv = $(`.objDiv[key=${key}]`);
    
    let languageControl = ['#showSubLanguageCheckBox',
        '#subLanguageSelect', '#mainLanguageSelect'];
    
    let editClasses = ['objTxt', 'txtInput', 'txtAreaInput',
        'objEditButton', 'objCancelEditButton', 'objSubmitButton', 'objDelButton'];

    let editDiv = objDiv.find('.objEditDiv');
    let editBtn = editDiv.find('.objEditButton');
    editBtn.click(() => {
        languageControl.forEach(element =>{
            $(element).prop('disabled', true);
        })
        editClasses.forEach(className => {
            let editClassDivs = objDiv.find(`.${className}`);
            editClassDivs.addClass('editing');
        });
    });
    let cancelBtn = objDiv.find('.objCancelEditButton');
    cancelBtn.click(() => {
        languageControl.forEach(element =>{
            $(element).prop('disabled', false);
        })
        editClasses.forEach(className => {
            let editClassDivs = objDiv.find(`.${className}`);
            editClassDivs.removeClass('editing');
        });
    })
    let submitBtn = objDiv.find('.objSubmitButton');
    submitBtn.click(async function () {
        languageControl.forEach(element =>{
            $(element).prop('disabled', false);
        })
        editClasses.forEach(className => {
            let editClassDivs = objDiv.find(`.${className}`);
            editClassDivs.removeClass('editing');
        });

        let updateValue = {};
        let needUpdate = false;
        let inputFields = objDiv.find('.txtInput, .txtAreaInput').toArray();
        inputFields.forEach(inputField => {
            inputField = $(inputField);
            let valueKey = inputField.attr('valueKey');
            let dataValue = obj[valueKey];
            let inputValue = encodeURIComponent(inputField.val());
            if (dataValue !== inputValue) {
                needUpdate = true;
                updateValue[valueKey] = inputValue;
            }
        });
        if (needUpdate) {
            let updateObj = updateObjMaker(key, parentPath, updateValue, refProj);
            let promises = await batchUpdateDatabase([updateObj], db);
            try {
                await Promise.all(promises);
            } catch (error) {
                console.error(error);
            }
        }
    });
    let delBtn = objDiv.find('.objDelButton');
    delBtn.click(async function () {
        editClasses.forEach(className => {
            let editClassDivs = objDiv.find(`.${className}`);
            editClassDivs.removeClass('editing');
        });
        await deleteDataWithOrder(key, orderPropName, parentPath, db, project, refProj);
    });
    let addBelowBtn = objDiv.find('.objAddBelowBtn');
    addBelowBtn.click(async function () {
        let targetOrder = parseInt(obj[orderPropName], 10) + 1;
        await addDataWithOrder(emptyKey, parentPath, orderPropName, targetOrder);
    });
}

function makeEditableTxtField(obj, itemName, valueKey, inputType) {
    let objNameTxt = DOMmaker('div', 'objTxt');
    let dataTxt = decodeURIComponent(obj[valueKey]);
    let dataTxtHtml = dataTxt.replace(/\n/g, '<br>');
    objNameTxt.addClass(itemName);
    objNameTxt.html(dataTxtHtml);
    let objNameInputTitle = DOMmaker('div', 'txtInputTitle');
    objNameInputTitle.addClass(itemName);
    objNameInputTitle.text(itemName + ' ' +valueKey + ':');
    
    let className = '';
    switch(inputType){
        case 'input':
            className = 'txtInput';
            break;
        case 'textarea':
            className = 'txtAreaInput';
            break;
        default:
            console.error(`no such input type: ${inputType}`);
            break;
    }
    let objNameInput = DOMmaker(inputType, className);
    objNameInput.attr('valueKey', valueKey);
    objNameInput.addClass(itemName);
    objNameInput.val(dataTxt);
    return [objNameInputTitle, objNameTxt, objNameInput];
}

function setOrderDiv(key, parentPath, orderPropName, obj) {
    let objDiv = $(`.objDiv[key=${key}]`);
    let orderTxt = objDiv.find('.objOrderTxt');
    orderTxt.text(obj[orderPropName]);
    let orderUpBtn = objDiv.find('.objOrderButton.up');
    orderUpBtn.click(() => ObjectOrderAdd(-1, obj[orderPropName], key,
        parentPath, orderPropName, db, refProj, project));
    let orderDownBtn = objDiv.find('.objOrderButton.down');
    orderDownBtn.click(() => ObjectOrderAdd(1, obj[orderPropName], key,
        parentPath, orderPropName, db, refProj, project));
}

function DisplayDramas(){

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
            let currentDramaName = decodeURIComponent(currentItem.dramaName);
            let pagingContent = $('<div>').html( currentDramaName+ '<br>' + currentItem.dateInStory).addClass('pagingContent');
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
    dramaOrderUpButton.click(()=> {
        ObjectOrderAdd(-1, data.dramaOrder, currentDramaKey, 'dramas', 'dramaOrder', db, refProj, project);
    });
    let dramaOrderDisplay = $('<div>').text(data.dramaOrder).addClass('left');
    let dramaOrderDownButton = $('<button>').text('▼').addClass('left');
    dramaOrderDownButton.click(()=> {
        ObjectOrderAdd(1, data.dramaOrder, currentDramaKey, 'dramas', 'dramaOrder', db, refProj, project);
    });
    let decodedDramaName = decodeURIComponent(data.dramaName);
    let dramaNameRow = $('<div>').addClass('rowParent');
    let dramaName = $('<div>').text('Drama Name:').attr({class: 'leftTitle'});
    let dramaNameData = $('<div>').text(decodedDramaName).addClass('left');
    let dramaNameEdit = $('<input>').attr({ type: 'string',
     value: decodedDramaName, class: 'left', id:'dramaNameEdit'});
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
    if(typeof nowDramaLanguages[0] === 'string'){
        mainLanguageSelect.val(nowDramaLanguages[0]);
    }else{
        nowDramaLanguages[0] = languages[0];
        mainLanguageSelect.val(languages[0]);
    }
    mainLanguageSelect.attr('id', 'mainLanguageSelect');
    mainLanguageSelect.change(()=>{
        let all = $('.dialogTalkDivAll');
        let left = $('.dialogTalkDivLeft');
        let mainLang = $('#mainLanguageSelect').val();

        left.toArray().forEach(element=>{
            DisplayTalk(element, mainLang); });
        // DisplayTalk(left, mainLang);
        all.toArray().forEach(element=>{
            DisplayTalk(element, mainLang); });
        // DisplayTalk(all, mainLang);
        nowDramaLanguages[0] = mainLang;
    });
    let showSubLanguage = $('<div>').text('Show Sub Language').addClass('left').addClass('marginLeft');
    let showSubLanguageCheckBox = $('<input>').attr('id', 'showSubLanguageCheckBox').addClass('left');
    showSubLanguageCheckBox.attr('type','checkbox');
    showSubLanguageCheckBox.prop('checked', nowShowingSubLanguage);
    showSubLanguageCheckBox.change(()=> {
        let left = $('.dialogTalkDivLeft');
        let right = $('.dialogTalkDivRight');
        let all = $('.dialogTalkDivAll');
        let mainLang = $('#mainLanguageSelect').val();
        let subLang = $('#subLanguageSelect').val();
        let self = $('#showSubLanguageCheckBox');
        if(self.prop('checked')){
            //show
            nowShowingSubLanguage = true;
            left.removeClass('hide');
            left.toArray().forEach(element=>{
                DisplayTalk(element, mainLang); });
            // DisplayTalk(left, mainLang);
            right.removeClass('hide');
            right.toArray().forEach(element=>{
                DisplayTalk(element, subLang); });
            // DisplayTalk(right, subLang);
            all.addClass('hide');
        }else{
            nowShowingSubLanguage = false;
            //hide
            all.removeClass('hide');
            all.toArray().forEach(element=>{
                DisplayTalk(element, subLang); });
            // DisplayTalk(all, mainLang);
            left.addClass('hide');
            right.addClass('hide');
        }
    });
    let subLanguage = $('<div>').text('Sub Language:').addClass('left').addClass('marginLeft');
    let subLanguageSelect = makeDropdownWithStringArray(languages).addClass('left');
    subLanguageSelect.attr('id', 'subLanguageSelect');
    if(typeof nowDramaLanguages[1] === 'string'){
        subLanguageSelect.val(nowDramaLanguages[1]);
    }else{
        nowDramaLanguages[1] = languages[1];
        subLanguageSelect.val(languages[1]);
    }
    subLanguageSelect.change(()=>{
        let right = $('.dialogTalkDivRight');
        let subLang = $('#subLanguageSelect').val();
        right.toArray().forEach(element=>{
            DisplayTalk(element, subLang); });
        // DisplayTalk(right, subLang);
        nowDramaLanguages[1] = subLang;
    });
    languageDiv.append([mainLanguage, mainLanguageSelect, showSubLanguage, showSubLanguageCheckBox, subLanguage, subLanguageSelect]);

    $('#dramaContent').attr('data-key', key);
    $('#dramaContent').attr('dramaOrder', data.dramaOrder);
    let delButton = $('<button>').text('Delete Drama').addClass('right');
    delButton.click(() => deleteDrama(key));
    dramaOrderRow.append([dramaOrder, dramaOrderUpButton, dramaOrderDisplay, dramaOrderDownButton, delButton]);
    dramaNameRow.append([dramaName, dramaNameData, dramaNameEdit, dramaNameButton]);
    dateInStoryRow.append([dateInStory, dateInStoryData, dateEdit, timeEdit, dateEditButton]);
    $('#dramaContent').append([dramaOrderRow, dramaNameRow, dateInStoryRow,languageDiv]);
    
    //Add Dialog Div
    // let dialogDivContainer = 
    // let dialogDivContainer = DOMmaker('div', 'dialogDivContainer', 'listTitleDiv');
    let dialogDivContainer = DOMmaker('div', 'objDivContainer','dialogDivContainer');
    // let addDialogDiv = DisplayTitle('Dialog', dialogTypes);
    let dialogTitle = DOMmaker('div', 'listTitleDiv');
    let dialogTitleTxt = $('<div>').text('Dialog').addClass('listTitleText');
    let dialogTitleSpace = $('<div>').addClass('fillSpace');
    let addDialogDiv = DOMmaker('div', 'addDialogDiv', 'addDialogDiv');    
    let newDialogType = makeDropdownWithStringArray(dialogTypes);
    newDialogType.attr('id', 'newDialogType');
    newDialogType.addClass('newDialogType');
    let addDialogBtn = DOMmaker('button', 'addDialogBtn', 'addDialogBtn');
    // let addDialogBtn = addDialogDiv.find('.listTitleAddNewObjectButton');
    addDialogBtn.text('add dialog');
    addDialogBtn.click(()=> {
        let newDialog = generateNewDialog(newDialogType.val());
        addDataWithOrder(newDialog, refDramas + '/' + key + '/dialogs', 'order');
    });
    
    dialogTitle.append([dialogTitleTxt, dialogTitleSpace, newDialogType, addDialogBtn]);
    dialogDivContainer.append([addDialogDiv]);

    //Show Dialogs
    DisplayDialogs(dialogDivContainer);
    
    $('#dramaContent').append([dialogTitle, dialogDivContainer]);    
    DivsSameWidth([dramaNameData, dateInStoryData]);
}

function DisplayTalk(jQueryDiv, language){
    jQueryDiv = $(jQueryDiv);
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
        displayName = decodeURIComponent(displayName);
        let displayNameString = jQueryDiv.find('.dialogDisplayNameString');
        $(displayNameString).text(displayName + ' : ');
        let displayNameInput = jQueryDiv.find('.dialogDisplayNameInput');
        $(displayNameInput).val(displayName);        
    }
    let speech = talk['speech'+language];
    if(speech == undefined)
    {
        speech = "talk['speech'+"+language+"] is undefined";
    }
    else
    {
        speech = decodeURIComponent(speech).replace(/\n/g, '<br>');
        let speechString = jQueryDiv.find('.dialogSpeechString');
        $(speechString).html(speech);
        let speechInput = jQueryDiv.find('.dialogSpeechInput');
        speech = speech.replace(/<br>/g, '\n');
        $(speechInput).val(speech);
    }
}

async function DisplayDialogs(dialogDivContainer) {
    let dialogs = project.dramas[currentDramaKey].dialogs;
    
    let mainLang = nowDramaLanguages[0];
    let subLang = nowDramaLanguages[1];
    if(CheckObject(dialogs) == false){
        dialogDivContainer.text('There is no dialog');
        return;
    }
    let dialogKeys = Object.keys(dialogs);
    dialogKeys.sort((a, b)=> dialogs[a].order - dialogs[b].order);
    
    dialogKeys.forEach((key)=>{
        let nowRefPath = 'dramas/'+ currentDramaKey +'/dialogs';
        
        let dialogDiv = DOMmaker('div', 'objDiv').attr('key', key);
        let orderDiv = DOMmaker('div', 'objOrderDiv').attr('key', key);
        let orderUpBtn = DOMmaker('button', 'objOrderButton').attr('key', key);
        orderUpBtn.text('▲');
        $(orderUpBtn).click(()=>{
            ObjectOrderAdd(-1, dialogs[key].order, key, nowRefPath, 'order',
                db, refProj, project);
        })
        let orderDownBtn = DOMmaker('button', 'objOrderButton').attr('key', key);
        orderDownBtn.text('▼');
        $(orderDownBtn).click(()=>{
            ObjectOrderAdd(1, dialogs[key].order, key, nowRefPath, 'order',
                db, refProj, project);
        })
        let orderTxt = DOMmaker('div', 'objOrderTxt').attr('key', key);
        orderTxt.text(dialogs[key].order);
        orderDiv.append([orderUpBtn, orderTxt, orderDownBtn]);
        dialogDiv.append(orderDiv);
        
        switch(dialogs[key].type){
            case 'talk':
                let speakerDiv = DOMmaker('div', 'dialogSpeakerDiv').attr('key', key);
                
                let speakerValue = dialogs[key].speaker === ""? 'no speaker': dialogs[key].speaker;
                speakerValue = decodeURIComponent(speakerValue);
                let speakerString = DOMmaker('div', 'dialogSpeakerString').attr('key', key)
                speakerString.text(speakerValue);
                let speakerInput = DOMmaker('input', 'dialogSpeakerInput').attr('key', key);
                speakerInput.attr({type: 'string', value: speakerValue});
                speakerDiv.append([speakerString, speakerInput]);
                
                let displayNameMain = dialogs[key]['displayName' + mainLang];
                let displayNameSub = dialogs[key]['displayName' + subLang];
                let speechMain = dialogs[key]['speech' + mainLang];
                let speechSub = dialogs[key]['speech' + subLang];
                let txt = displayNameMain + '<br>' + speechMain;

                function generateTalkDiv(parentDiv, language){
                    let displayName = dialogs[key]['displayName' + language];
                    displayName = decodeURIComponent(displayName);
                    let speech = dialogs[key]['speech' + language];
                    speech = decodeURIComponent(speech);
                    // speech = speech.replace(/\n/g, '<br>');
                    let displayNameDiv = DOMmaker('div', 'dialogDisplayNameDiv').attr('key', key);
                    let displayNameString = DOMmaker('div', 'dialogDisplayNameString').attr('key', key);
                    let displayNameInput = DOMmaker('input', 'dialogDisplayNameInput').attr('key', key);
                    displayNameInput.attr({type: 'string', value: displayName});
                    displayNameString.text(displayName + ' : ');
                    displayNameDiv.append([displayNameString, displayNameInput]);
                    let speechDiv = DOMmaker('div', 'dialogSpeechDiv').attr('key', key);
                    let speechString = DOMmaker('div', 'dialogSpeechString').attr('key', key);
                    // speechString.text(speech);
                    let speechInput = DOMmaker('textarea', 'dialogSpeechInput').attr('key', key);
                    speechInput.attr({type: 'string', value: speech});
                    speechDiv.append([speechString, speechInput]);
                    parentDiv.append([displayNameDiv, speechDiv]);
                }

                let talkDiv = DOMmaker('div', 'dialogTalkDiv').attr('key', key);
                let talkDivAll = DOMmaker('div', 'dialogTalkDivAll').attr('key', key);
                if(nowShowingSubLanguage){
                    talkDivAll.addClass('hide');
                }
                generateTalkDiv(talkDivAll, mainLang);
                
                let talkDivLeft = DOMmaker('div', 'dialogTalkDivLeft').attr('key', key);
                if(nowShowingSubLanguage === false){
                    talkDivLeft.addClass('hide');
                }
                generateTalkDiv(talkDivLeft, mainLang);
                
                let talkDivRight = DOMmaker('div', 'dialogTalkDivRight').attr('key', key);
                if(nowShowingSubLanguage === false){
                    talkDivRight.addClass('hide');
                }
                generateTalkDiv(talkDivRight, subLang);
                
                talkDiv.append([talkDivAll, talkDivLeft, talkDivRight]);
                dialogDiv.append([speakerDiv, talkDiv]);
                
                if(nowShowingSubLanguage){
                    DisplayTalk(talkDivLeft, mainLang);
                    DisplayTalk(talkDivRight, subLang);
                }else{
                    DisplayTalk(talkDivAll, mainLang);
                }
                
                break;
            case 'label':
                let labelDiv = DOMmaker('div', 'dialogLabelDiv');
                labelDiv.attr('key', key);
                let labelTitleDiv = DOMmaker('div', 'labelTitleDiv');
                labelTitleDiv.text('Label: ');
                labelTitleDiv.attr('key', key);
                let labelName = DOMmaker('div', 'labelNameDiv');
                let labelNameInput = DOMmaker('input', 'labelNameInput');
                if(typeof dialogs[key].labelName !== 'string'){
                    labelName.text('dialogs[key].labelName !== \'string\'');
                    labelNameInput.val("");
                }else{
                    let dataLabelName = decodeURIComponent(dialogs[key].labelName);
                    if(dataLabelName === ''){
                        labelName.text('Label name is Empty');
                        labelName.css('color', 'gray');
                    }else{
                        labelName.text(dataLabelName);
                        labelName.css('color', 'black');
                    }
                    labelNameInput.val(dataLabelName);
                }
                labelName.attr('key', key);
                labelNameInput.attr('key', key);
                labelDiv.append([labelTitleDiv, labelName, labelNameInput]);
                dialogDiv.append([labelDiv]);
                break;
            case 'keyJump':
                break;
            default:
                return;
        }
        
        let EditingElements = [`.editDialogButton[key=${key}]`,
            `.submitDialogButton[key=${key}]`,
            `.cancelEditDialogButton[key=${key}]`,
            `.delDialogButton[key=${key}]`];
            
        
        let EditingTalkElements = [
            `.dialogDisplayNameString[key=${key}]`,
            `.dialogDisplayNameInput[key=${key}]`,
            `.dialogSpeechString[key=${key}]`,
            `.dialogSpeechInput[key=${key}]`,
            `.dialogSpeakerString[key=${key}]`,
            `.dialogSpeakerInput[key=${key}]`
        ];
        
        let EditingLabelElements = [
            `.labelNameDiv[key=${key}]`,
            `.labelNameInput[key=${key}]`
        ];

        let EditContentElement = [`.dialogDisplayNameInput[key=${key}]`,
            `.dialogSpeechInput[key=${key}]`, `.dialogSpeakerInput[key=${key}]`];
        
        let languageControl = ['#showSubLanguageCheckBox',
            '#subLanguageSelect', '#mainLanguageSelect'];
        
        let editDiv = DOMmaker('div', 'dialogEditDiv');
        function DisplaySpeaker() {
            let speakerVal = decodeURIComponent(dialogs[key].speaker);
            speakerVal = speakerVal === "" ? 'no speaker' : speakerVal;
            $(`.dialogSpeakerString[key=${key}]`).text(speakerVal);
        }
        let editDialogBtn = DOMmaker('button', 'editDialogButton');
        editDialogBtn.attr('key', key);
        editDialogBtn.attr('order', dialogs[key].order);
        editDialogBtn.text('Edit');

        editDialogBtn.click(()=>{
            EditingElements.forEach(element =>{
                $(element).addClass('editing');
            });
            languageControl.forEach(element=>{
                $(element).prop('disabled', true);
            });
            switch(dialogs[key].type){
                case 'talk':
                    EditingTalkElements.forEach(element =>{
                        $(element).addClass('editing');
                    });
                    $(`.dialogSpeakerString[key=${key}]`).text('Character :');
                    $(`.dialogDisplayNameString[key=${key}]`).text('DisplayName ' + mainLang + ' : ');
                    $(`.dialogSpeechString[key=${key}]`).text('Speech ' + mainLang + ' : ');
                    if(nowShowingSubLanguage){
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivLeft[key='${key}']`);
                        let mainLangDisplayName = dialogs[key][`displayName${mainLang}`];
                        mainLangDisplayName = decodeURIComponent(mainLangDisplayName);
                        mainLangDiv.find(`.dialogDisplayNameInput[key=${key}]`)
                            .val(mainLangDisplayName);
                        let mainLangSpeech = dialogs[key][`speech${mainLang}`];
                        mainLangSpeech = decodeURIComponent(mainLangSpeech);
                        mainLangSpeech = mainLangSpeech.replace(/<br>/g, '\n');
                        mainLangDiv.find(`.dialogSpeechInput[key="${key}"]`)
                            .val(mainLangSpeech);
                        let subLang = nowDramaLanguages[1];
                        let subLangDiv = $(`.dialogTalkDivRight[key=${key}]`);
                        let subLangDisplayName = dialogs[key][`displayName${subLang}`];
                        subLangDisplayName = decodeURIComponent(subLangDisplayName);
                        subLangDiv.find(`.dialogDisplayNameInput[key="${key}"]`)
                            .val(subLangDisplayName);
                        let subLangSpeech = dialogs[key][`speech${subLang}`];
                        subLangSpeech = decodeURIComponent(subLangSpeech);
                        subLangSpeech = subLangSpeech.replace(/<br>/g, '\n');
                        subLangDiv.find(`.dialogSpeechInput[key="${key}"]`)
                            .val(subLangSpeech);
                        
                    }else{
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivAll[key='${key}']`);
                        let mainLangDisplayName = dialogs[key][`displayName${mainLang}`];
                        mainLangDisplayName = decodeURIComponent(mainLangDisplayName);
                        let mainLangSpeech = dialogs[key][`speech${mainLang}`];
                        mainLangSpeech = decodeURIComponent(mainLangSpeech);
                        mainLangSpeech = mainLangSpeech.replace(/<br>/g, '\n');
                        mainLangDiv.find(`.dialogDisplayNameInput[key=${key}]`)
                            .val(mainLangDisplayName);
                        mainLangDiv.find(`.dialogSpeechInput[key="${key}"]`)
                            .val(mainLangSpeech);
                    }
                    
                    break;
                case 'label':
                    EditingLabelElements.forEach(element=>{
                        $(element).addClass('editing');
                    });
                    break;
                case 'keyJump':
                    break;
                default:
                    break;
            }
        });
        let cancelEditDialogBtn = DOMmaker('button', 'cancelEditDialogButton');
        cancelEditDialogBtn.attr('key', key);
        cancelEditDialogBtn.attr('order', dialogs[key].order);

        cancelEditDialogBtn.text('Cancel');

        cancelEditDialogBtn.click(async function(){
            DisplaySpeaker();
            EditingElements.forEach(element =>{
                $(element).removeClass('editing');
            });
            languageControl.forEach(element=>{
                $(element).prop('disabled', false);
            });
            switch(dialogs[key].type){
                case 'talk':
                    if(nowShowingSubLanguage){
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivLeft[key='${key}']`);
                        let subLang = nowDramaLanguages[1];
                        let subLangDiv = $(`.dialogTalkDivRight[key=${key}]`);
                        DisplayTalk(mainLangDiv, mainLang);
                        DisplayTalk(subLangDiv, subLang);
                    }else{
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivAll[key='${key}']`);
                        DisplayTalk(mainLangDiv, mainLang);
                    }
                    EditingTalkElements.forEach(element =>{
                        $(element).removeClass('editing');
                    });
                    break;
                case 'label':
                    EditingLabelElements.forEach(element=>{
                        $(element).removeClass('editing');
                    });
                    break;
                case 'keyJump':
                    break;
                default:
                    break;
            }
            
            
        });
        let submitDialogBtn = DOMmaker('button', 'submitDialogButton');
        submitDialogBtn.attr('key', key);
        submitDialogBtn.attr('order', dialogs[key].order);
        submitDialogBtn.text('Submit');
        submitDialogBtn.click(async function(){
            DisplaySpeaker();
            EditingElements.forEach(element =>{
                $(element).removeClass('editing');
            });
            languageControl.forEach(element=>{
                $(element).prop('disabled', false);
            });
            switch(dialogs[key].type){
                case 'talk':

                    if(nowShowingSubLanguage){
                        let speaker = $(`.dialogSpeakerInput[key="${key}"]`).val();
                        speaker = encodeURIComponent(speaker);
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivLeft[key='${key}']`);
                        let mainLangDisplayName = mainLangDiv.find(
                            `.dialogDisplayNameInput[key=${key}]`).val();
                        mainLangDisplayName = encodeURIComponent(mainLangDisplayName);
                        let mainLangSpeech = mainLangDiv.find(
                            `.dialogSpeechInput[key="${key}"]`).val();
                        mainLangSpeech = mainLangSpeech.replace(/\n/g, '<br>');
                        mainLangSpeech = encodeURIComponent(mainLangSpeech);
                        let subLang = nowDramaLanguages[1];
                        let subLangDiv = $(`.dialogTalkDivRight[key=${key}]`);
                        let subLangDisplayName = subLangDiv.find(
                            `.dialogDisplayNameInput[key="${key}"]`).val();
                        subLangDisplayName = encodeURIComponent(subLangDisplayName);
                        let subLangSpeech = subLangDiv.find(
                            `.dialogSpeechInput[key="${key}"]`).val();
                        subLangSpeech = subLangSpeech.replace(/\n/g, '<br>');
                        subLangSpeech = encodeURIComponent(subLangSpeech);
                        let updateObj = {};
                        let dataMainLangDisplayName = dialogs[key][`displayName${mainLang}`];
                        let dataMainLangSpeech = dialogs[key][`speech${mainLang}`];
                        let dataSubLangDisplayName = dialogs[key][`displayName${subLang}`];
                        let dataSubLangSpeech = dialogs[key][`speech${subLang}`];
                        if(speaker !== dialogs[key]['speaker']){
                            updateObj['speaker']=  speaker; }
                        if(mainLangDisplayName !== dataMainLangDisplayName){
                            updateObj[`displayName${mainLang}`] = mainLangDisplayName;     }
                        if(mainLangSpeech !== dataMainLangSpeech){
                            updateObj[`speech${mainLang}`] = mainLangSpeech; }
                        if(subLangDisplayName !== dataSubLangDisplayName){
                            updateObj[`displayName${subLang}`] = subLangDisplayName; }
                        if(subLangSpeech !== dataSubLangSpeech){
                            updateObj[`speech${subLang}`] = subLangSpeech; }
                        if(Object.keys(updateObj).length > 0){
                            let updateList = [];
                            updateList.push(updateObjMaker(key, nowRefPath, updateObj, refProj));
                            let promises = await batchUpdateDatabase(updateList, db);
                            try{
                                await Promise.all(promises);
                            }catch(error){
                                console.error(error);
                            }
                        }
                        DisplayTalk(mainLangDiv, mainLang);
                        DisplayTalk(subLangDiv, subLang);
                    }else{
                        let speaker = $(`.dialogSpeakerInput[key="${key}"]`).val();
                        speaker = encodeURIComponent(speaker);
                        let mainLang = nowDramaLanguages[0];
                        let mainLangDiv = $(`.dialogTalkDivAll[key='${key}']`);
                        let mainLangDisplayName = mainLangDiv.find(
                            `.dialogDisplayNameInput[key=${key}]`).val();
                        mainLangDisplayName = encodeURIComponent(mainLangDisplayName);
                        let mainLangSpeech = mainLangDiv.find(
                            `.dialogSpeechInput[key="${key}"]`).val();
                        mainLangSpeech = mainLangSpeech.replace(/\n/g, '<br>');
                        mainLangSpeech = encodeURIComponent(mainLangSpeech);
                        let updateObj = {};
                        let dataMainLangDisplayName = dialogs[key][`displayName${mainLang}`];
                        let dataMainLangSpeech = dialogs[key][`speech${mainLang}`];
                        if(speaker !== dialogs[key]['speaker']){
                            updateObj['speaker']=  speaker; }
                        if(mainLangDisplayName !== dataMainLangDisplayName){
                            updateObj[`displayName${mainLang}`] = mainLangDisplayName;     }
                        if(mainLangSpeech !== dataMainLangSpeech){
                            updateObj[`speech${mainLang}`] = mainLangSpeech; }
                        if(Object.keys(updateObj).length > 0){
                            let updateList = [];
                            updateList.push(updateObjMaker(key, nowRefPath, updateObj, refProj));
                            let promises = await batchUpdateDatabase(updateList, db);
                            try{
                                await Promise.all(promises);
                            }catch(error){
                                console.error(error);
                            }
                        }
                        DisplayTalk(mainLangDiv, mainLang);
                    }
                    EditingTalkElements.forEach(element =>{
                        $(element).removeClass('editing');
                    });
                    // updateObjMaker(key, )
                    break;
                case 'label':
                    let input = $(`.labelNameInput[key=${key}]`).val();
                    input = encodeURIComponent(input);
                    if(dialogs[key]['labelName'] !== input){
                        let updateObj = {};
                        updateObj['labelName'] = input;
                        updateObj = updateObjMaker(key, nowRefPath, updateObj, refProj)
                        let promises = await batchUpdateDatabase([updateObj], db);
                        try{
                            await Promise.all(promises);
                        }catch(error){
                            console.error(error);
                        }
                    }
                    EditingLabelElements.forEach(element=>{
                        $(element).removeClass('editing');
                    });
                    break;
                case 'keyJump':
                    break;
                default:
                    break;
            }
        });
        let delDialogBtn = DOMmaker('button', 'delDialogButton');
        delDialogBtn.attr('key', key);
        delDialogBtn.attr('order', dialogs[key].order);
        delDialogBtn.text('Delete');
        $(delDialogBtn).click(async function(){
            await deleteDataWithOrder(key, 'order', nowRefPath, db, project, refProj);
        });
        let addDialogBelowSelect = makeDropdownWithStringArray(dialogTypes);
        addDialogBelowSelect.addClass('addDialogBelowSelect');
        addDialogBelowSelect.attr('key', key);
        let addDialogBelowBtn = DOMmaker('button', 'addDialogBelowBtn');
        addDialogBelowBtn.attr('key', key);
        addDialogBelowBtn.attr('order', dialogs[key].order);
        addDialogBelowBtn.text('▼ Add Dialog');
        addDialogBelowBtn.click(async function(){
           let newDialog = generateNewDialog(addDialogBelowSelect.val());
            await addDataWithOrder(newDialog, refDramas + '/' + currentDramaKey + '/dialogs',
                'order', dialogs[key].order + 1);
        });
        
        editDiv.append([editDialogBtn, submitDialogBtn, cancelEditDialogBtn,
            delDialogBtn, addDialogBelowSelect, addDialogBelowBtn]);

        dialogDiv.append([editDiv]);
        dialogDivContainer.append(dialogDiv);
        
        
        let speakerDiv = DOMmaker('div', 'speakerDiv');
        let speechDiv = DOMmaker('div', 'speechDiv');
        
    })
}


function generateNewDialog(dialogType){
    let dialogToAdd; 
    switch (dialogType) {
        case "talk":
            dialogToAdd = Object.assign({}, emptyTalk);
            languages.forEach(language =>{
                let displayNameProp = 'displayName' + language;
                let speechProp = 'speech' + language;
                dialogToAdd[displayNameProp] = 'DisplayName '+language;
                dialogToAdd[speechProp] = 'Speech '+language;
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
    return dialogToAdd;
}







function DivsSameWidth(divs){
    let divWidths = [];
    divs.forEach(div => {divWidths.push(div.width())});
    let maxWidth = Math.max(divWidths);
    divs.forEach(div => {div.width(maxWidth)});
}

function EditDateInStory(){
    let newDate = $('#dateEdit').val() + " " + $('#timeEdit').val();
    let key = $('#dramaContent').attr('data-key');
    update(getRef(refDramas, key), {dateInStory: newDate});
}

function EditDramaName(){
    let newName = $('#dramaNameEdit').val();
    newName = encodeURIComponent(newName);
    let key = $('#dramaContent').attr('data-key');
    update(getRef(refDramas, key), {dramaName: newName});
}

function addNewDramaPagingButton(){
    let pagingDiv = $('<div>').addClass('paging');
    pagingDiv.html('Add new drama');
    pagingDiv.click(()=> addNewDrama() );
    return pagingDiv;
}

async function addNewDrama(){
    let pushRef = push(getRef(refDramas));
    let newDrama = await generateEmptyDrama(db, refDramas);
    await set(pushRef, newDrama);
    let snapshot = await get(pushRef);
    currentDramaKey = snapshot.key;
}

async function generateEmptyDrama(db, path) {
    // let snapshot = await get(ref(db, path), {
    let snapshot = await get(getRef(path), {
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
    await deleteDataWithOrder(key, 'dramaOrder', refDramas, db, project, refProj);
}

async function addDataWithOrder(obj, parentRef, orderPropName, targetOrder){
    let updateList = [];
    let promises = [];
    let parentObj = getDataByPath(parentRef, project);
    if(isObject(parentObj)){        
        let objKeys = orderObjectKeysByProp(parentObj, orderPropName);
        let lastKey = objKeys[objKeys.length - 1];
        let lastOrder = parseInt(parentObj[lastKey][orderPropName], 10);
        if(targetOrder === undefined){
            targetOrder = lastOrder + 1;
            console.log('沒有指定目標order，將目標order設為目前最大order+1')
        }else if(targetOrder > lastOrder + 1){
            targetOrder = lastOrder + 1;
            console.log('目標order大於目前最大order+1，將目標order設為目前最大order+1')
        }
        obj[orderPropName] = targetOrder;
        for(let i = 0; i < objKeys.length; i++){
            let objKey = objKeys[i];
            let objOrder = parseInt(parentObj[objKey][orderPropName], 10);
            if(objOrder >= targetOrder){
                let updateValues = {[orderPropName]: objOrder + 1};
                let updateObj = updateObjMaker(objKey, parentRef, updateValues, refProj);
                updateList.push(updateObj);
            }
        }
        // console.log(JSON.stringify(obj));
        if(updateList.length !== 0){
            promises = promises.concat(updateList.map(item=>{
                return update(ref(db, item.refPath), item.updateList);
            })        );
        }
    }else if(parentObj === undefined){
        obj[orderPropName] = 1;
    }else{
        throw new Error("parentRef不是指向object，也不是undefined")        
    }
    promises.push(set(push(getRef(parentRef)), obj));
    try{
        await Promise.all(promises);
    }catch(error){
        console.error(error);
    }
}



function getRef(parentRef, key){
    if(parentRef === undefined){
        throw new Error('未傳入parentRef');
    }
    if(typeof parentRef !== 'string'){
        throw new Error('parentRef不是string');
    }
    let refPath = refProj + '/' + parentRef;
    if(key !== undefined && typeof key === 'string'){
        refPath += '/' + key;
    }
    return ref(db, refPath);
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

// function makeDropdownWithStringArray(array){
//     let dropdown = $('<select>');
//     for(let i=0; i<array.length; i++){
//         let option = $('<option>');
//         option.text(array[i]);
//         option.val(array[i]);
//         dropdown.append(option);
//     }
//     return dropdown;
// }
//
// function DOMmaker(DOMtype, DOMclass, DOMid){
//     let dom = $('<' + DOMtype + '>').addClass(DOMclass);
//     if(DOMid !== undefined){dom.attr('id', DOMid);}
//     return dom;
// }