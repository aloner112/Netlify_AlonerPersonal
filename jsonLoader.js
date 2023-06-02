import {getDatabase, ref, set, get, child, onValue, update, remove, push, equalTo
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { app, auth } from "/auth.js";
import { DateToString, StringToDate } from "/StringTimeHelper.js"

auth.onAuthStateChanged(()=>{
    if(auth.currentUser){
        GetData();
    }
    else $('#data').empty();
});

var db = getDatabase();
var refDramas = "projects/testProject01/dramas";
var dramas;

var emptyDrama = {
    type: "drama",
    dramaName: "New Drama",
    dramaOrder: "00",
    dateInStory: "2000-01-01 00:00:00",
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
    onValue(ref(db, refDramas), (snapshot) =>{
        if(snapshot.exists()){
            dramas = snapshot.val();
            DisplayData();
        }else{
            console.log("No data available");
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

function DisplayData(){
    var dataDiv = $('#data')
    dataDiv.empty();
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dataContentDiv = $('<div>').addClass('dataContent');
    dataContentDiv.attr('id', 'dataContent');
    dramaKeys = getTypeKeysInJson(dramas, 'drama');
    let firstKey = 0;
    dramaKeys.forEach(dramaKey => {
        if(firstKey == 0) firstKey = dramaKey;
        let currentItem = dramas[dramaKey];
        let pagingDiv = $('<div>').addClass('paging');
        pagingDiv.html(currentItem.dramaName + '<br>' + currentItem.dateInStory);
        pagingDiv.attr('data-key', dramaKey);
        pagingDivAddEvent(pagingDiv);
        $(pagingDiv).appendTo(sidebarDiv);
    });
    $(sidebarDiv).append(addNewDramaPagingButton());
    $(dataDiv).append(sidebarDiv);
    $(dataDiv).append(dataContentDiv);
    let firstPagingDiv = $('.paging[data-key="' + firstKey +'"]');
    pagingClickHandler(firstPagingDiv);
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
    let data = dramas[key];
    let dramaOrderRow = $('<div>').addClass('rowParent');
    let dramaOrderRowLeft = $('<div>').addClass('left');
    let dramaOrder = $('<div>').text('Drama Order:').attr('id', 'dramaOrder').addClass('left');
    let dramaOrderEdit = $('<input>').attr({
        type: 'number', class: 'quantity-input', value: data.dramaOrder,
        min: '0', class: 'left.input', id: 'dramaOrderEdit'});
    let dramaNameRow = $('<div>').addClass('rowParent');
    let dramaName = $('<div>').text('Drama Name: ' + data.dramaName).attr({class: 'left'});
    let dramaNameEdit = $('<input>').attr({ type: 'string',
     value: data.dramaName, class: 'left', id:'dramaNameEdit'});
    let dramaNameButton = $('<button>').text('Modify Drama Name').addClass('left');
    dramaNameButton.click(() => EditDramaName());
    let dateInStoryRow = $('<div>').addClass('rowParent');
    let dateInStory = "<div>Date in story: " + data.dateInStory + "</div>";
    // let dialogues = "<div>" + data.dialogues.replace(/\n/g, '<br>') + "</div>";
    // let content = dramaName + dateInStory;
    // $('#dataContent').html(content);
    $('#dataContent').append(dramaOrder)
    $('#dataContent').attr('data-key', key);
    let delButton = $('<button>').text('Delete Drama').addClass('right');
    delButton.click(() => deleteDrama(key));
    // dramaOrderRowLeft.append([dramaOrder, dramaOrderEdit])
    dateInStoryRow.append([dateInStory]);
    dramaOrderRow.append([dramaOrder, dramaOrderEdit, delButton]);
    dramaNameRow.append([dramaName, dramaNameEdit, dramaNameButton]);
    $('#dataContent').append([dramaOrderRow, dramaNameRow, dateInStoryRow]);
}

function EditDramaName(){
    let newName = $('#dramaNameEdit').val();
    let key = $('#dataContent').attr('data-key');
    let obj = Object.assign({}, dramas[key]);
    obj.dramaName = newName;
    set(ref(db, refDramas + '/' + key), obj);
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
    set(pushRef, newDrama);
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
function deleteDrama(key){
    remove(ref(db, refDramas + "/" + key));
}

function getTypeKeysInJson(dataObj, targetType){
    let tmpDramaKeys = Object.keys(dataObj).filter(
        key => dataObj[key].type == targetType);
    return tmpDramaKeys;
}