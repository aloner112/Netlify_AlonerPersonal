import {getDatabase, ref, set, get, child, onValue, update, remove, push
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { app, auth } from "/auth.js";

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
    dateInStory: "date in story",
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
    get(ref(db, refDramas)).then((snapshot) =>{
        if(snapshot.exists()){
            dramas = snapshot.val();
            DisplayData();
        }else{
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    })    
}

function DisplayData(){
    var dataDiv = $('#data')
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
    let key = $(pagingDiv).attr('data-key');
    let data = dramas[key];
    let dramaOrder = "<div>Drama Order: " + data.dramaOrder + "</div>";
    let dramaName = "<div>Drama Name: " + data.dramaName + "</div>";
    let dateInStory = "<div>Date in story: " + data.dateInStory + "</div>";
    // let dialogues = "<div>" + data.dialogues.replace(/\n/g, '<br>') + "</div>";
    let content = dramaOrder + dramaName + dateInStory;
    $('#dataContent').html(content);
}

function addNewDramaPagingButton(){
    let pagingDiv = $('<div>').addClass('paging');
    pagingDiv.html('Add new drama');
    pagingDiv.click(()=> addNewDrama() );
    return pagingDiv;
}

function addNewDrama(){
    let pushRef = push(ref(db, refDramas));
    set(pushRef, emptyDrama);
}

function getTypeKeysInJson(dataObj, targetType){
    let tmpDramaKeys = Object.keys(dataObj).filter(
        key => dataObj[key].type == targetType);
    return tmpDramaKeys;
}