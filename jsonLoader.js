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

$(document).ready(function () {
    var dataDiv = $('#data')
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dataContentDiv = $('<div>').addClass('dataContent');
    // dataDiv.text(Object.keys(testJson).length.toString());
    // dataDiv.text(testJson.page1.name);
    dramaKeys = getTypeKeysInJson(testJson, 'drama');
    let firstKey = 0;
    dramaKeys.forEach(dramaKey => {
        if(firstKey == 0) firstKey = dramaKey;
        let currentItem = testJson[dramaKey];
        let pagingDiv = $('<div>').addClass('paging');
        pagingDiv.html(currentItem.name + '<br>' + currentItem.time);
        pagingDiv.attr('data-key', dramaKey);
        pagingDivAddEvent(pagingDiv);
        $(pagingDiv).appendTo(sidebarDiv);
    });
    $(sidebarDiv).append(addNewDramaButtonPaging());
    $(dataDiv).append(sidebarDiv);
    $(dataDiv).append(dataContentDiv);
    let firstPagingDiv = $('.paging[data-key="' + firstKey +'"]');
    pagingClickHandler(firstPagingDiv);
});

function pagingDivAddEvent(pagingDiv){
    $(pagingDiv).click(function(){
        pagingClickHandler(pagingDiv);
    });
}

function pagingClickHandler(pagingDiv){
    $('.paging').removeClass('selected');
    $(pagingDiv).addClass('selected');
    let key = $(pagingDiv).attr('data-key');
    let data = testJson[key];
    let dataContent = data.content.replace(/\n/g, '<br>');
    $('.dataContent').html(dataContent);
}

function addNewDramaButtonPaging(){
    let pagingDiv = $('<div>').addClass('paging');
    pagingDiv.html('Add new drama');
    return pagingDiv;
}

function getTypeKeysInJson(jsonObj, targetType){
    let tmpDramaKeys = [];
    // 遍歷 JSON 物件的每個屬性
    for (let key in jsonObj) {
        if(jsonObj.hasOwnProperty(key) == false) continue;
        let item = jsonObj[key];
        if (item.type !== targetType) continue;
        tmpDramaKeys.push(key);
    }
    return tmpDramaKeys;
}