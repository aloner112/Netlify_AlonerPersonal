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
const refDramas = "projects/testProject01/dramas";
const dbRef = ref(db, refDramas);
var dramas;
var currentDramaKey = null;

var emptyDrama = {
    type: "drama",
    dramaName: "New Drama",
    dramaOrder: "00",
    dateInStory: "2000-01-01 00:00",
    dialogues:{},
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
            dramas = snapshot.val();
            DisplayData();
        }else{
            DisplayEmptyData()
        }
    });
    // get(ref(db, refDramas)).then((snapshot) =>{
    //     if(snapshot.exists()){
    //         dramas = snapshot.val();
    //         DisplayData();
    //     }else{
    //         console.log("No data available");
    //     }
    // }).catch((error) => {
    //     console.error(error);
    // })    
}

function DisplayEmptyData(){
    var dataDiv = $('#data')
    dataDiv.empty();
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dataContentDiv = $('<div>').addClass('dataContent');
    dataContentDiv.attr('id', 'dataContent');
    $(sidebarDiv).append(addNewDramaPagingButton());
    $(dataDiv).append(sidebarDiv);
    $(dataDiv).append(dataContentDiv);
}

function DisplayData(){
    var dataDiv = $('#data')
    dataDiv.empty();
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dataContentDiv = $('<div>').addClass('dataContent');
    dataContentDiv.attr('id', 'dataContent');
    dramaKeys = getTypeKeysInJson(dramas, 'drama');
    if(dramaKeys.length != 0){
        let firstKey = 0;
        let pagingDivArray = [];
        dramaKeys.forEach(dramaKey => {
            if(firstKey == 0) firstKey = dramaKey;
            let currentItem = dramas[dramaKey];
            let pagingDiv = $('<div>').addClass('paging');
            pagingDiv.html(currentItem.dramaOrder + ' ' + currentItem.dramaName + '<br>' + currentItem.dateInStory);
            pagingDiv.attr({'data-key': dramaKey, 'dramaOrder': currentItem.dramaOrder});
            pagingDivAddEvent(pagingDiv);
            pagingDivArray.push(pagingDiv);
            // $(pagingDiv).appendTo(sidebarDiv);
        });
        pagingDivArray.sort((divA, divB) => {return getDivOrder(divA) - getDivOrder(divB)});
        $(sidebarDiv).append(pagingDivArray);
        $(sidebarDiv).append(addNewDramaPagingButton());
        $(dataDiv).append(sidebarDiv);
        $(dataDiv).append(dataContentDiv);
        if(currentDramaKey == null) currentDramaKey = firstKey;
        let showPageDiv = $('.paging[data-key="' + currentDramaKey +'"]');
        pagingClickHandler(showPageDiv);
    }else{
        $(sidebarDiv).append(addNewDramaPagingButton());
        $(dataDiv).append(sidebarDiv);
        $(dataDiv).append(dataContentDiv);
    }

}

function getDivOrder(myDiv){
    return myDiv.attr('dramaOrder');
}

function pagingDivAddEvent(pagingDiv){
    $(pagingDiv).click(function(){
        pagingClickHandler(pagingDiv);
    });
}

function pagingClickHandler(pagingDiv){
    $('.paging').removeClass('selected');
    $(pagingDiv).addClass('selected');
    $('#dataContent').empty();
    let key = $(pagingDiv).attr('data-key');
    currentDramaKey = key;
    let data = dramas[key];
    let dramaOrderRow = $('<div>').addClass('rowParent');
    // let dramaOrderRowLeft = $('<div>').addClass('left');
    let dramaOrder = $('<div>').text('Drama Order:').attr('id', 'dramaOrder').addClass('leftTitle');
    let dramaOrderEdit = $('<input>').attr({type: 'number', class: 'quantity-input',
     'value': data.dramaOrder, min: '0', class: 'left.input', id: 'dramaOrderEdit'});
     dramaOrderEdit.data('previousValue', data.dramaOrder);
    dramaOrderEdit.change(function(){
        let previousValue = $(this).data('previousValue');
        ChangeDramaOrder(previousValue);
    });
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
    
    // let dialogues = "<div>" + data.dialogues.replace(/\n/g, '<br>') + "</div>";
    // let content = dramaName + dateInStory;
    // $('#dataContent').html(content);
    $('#dataContent').append(dramaOrder)
    $('#dataContent').attr('data-key', key);
    let delButton = $('<button>').text('Delete Drama').addClass('right');
    delButton.click(() => deleteDrama(key));
    // dramaOrderRowLeft.append([dramaOrder, dramaOrderEdit])
    dateInStoryRow.append([dateInStory, dateInStoryData, dateEdit, timeEdit, dateEditButton]);
    dramaOrderRow.append([dramaOrder, dramaOrderEdit, delButton]);
    dramaNameRow.append([dramaName, dramaNameData, dramaNameEdit, dramaNameButton]);
    $('#dataContent').append([dramaOrderRow, dramaNameRow, dateInStoryRow]);
    DivsSameWidth([dramaNameData, dateInStoryData]);
}

async function UpdateDramas(){
    let snapshot = await get(dbRef);
    if(snapshot.exists()){
        dramas = snapshot.val();
    }else{
        console.error('snapshot not exist!')
    }
}

async function ChangeDramaOrder(previousValue){
    previousValue = parseInt(previousValue, 10);
    let order = parseInt($('#dramaOrderEdit').val(), 10);
    let key = $('#dataContent').attr('data-key');
    await UpdateDramas();
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
    let largestOrder = parseInt(orderAndKeys[orderAndKeys.length -1].order, 10);
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
    // console.log(newDate);
    let key = $('#dataContent').attr('data-key');
    // let obj = Object.assign({}, dramas[key]);
    // obj.dateInStory = newDate;
    update(ref(db, refDramas + '/' + key), {dateInStory: newDate});
}

function EditDramaName(){
    let newName = $('#dramaNameEdit').val();
    let key = $('#dataContent').attr('data-key');
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
    let showPageDiv = $('.paging[data-key="' + currentDramaKey +'"]');
    pagingClickHandler(showPageDiv);
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
    let divs = $('.paging');
    // if(divs.length == 1)
    let currentDiv = $('.paging[data-key="' + key +'"]');
    // let currentOrder = parseInt(currentDiv.attr('dramaOrder'), 10);
    let closestDiv = findClosestDiv(divs, currentDiv);
    // console.log('closestDiv is null?' + `${closestDiv == null}`);
    if(closestDiv != null) pagingClickHandler(closestDiv);    
    await remove(ref(db, refDramas + "/" + key));
    await UpdateDramas();
}

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