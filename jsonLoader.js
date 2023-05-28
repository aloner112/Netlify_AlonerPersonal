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

var dramas;

$(document).ready(function () {
    var dataDiv = $('#data')
    var sidebarDiv = $('<div>').addClass('sidebar');
    var dataContentDiv = $('<div>').addClass('dataContent');
    // dataDiv.text(Object.keys(testJson).length.toString());
    // dataDiv.text(testJson.page1.name);
    dramas = getDramasInJson(testJson);
    let firstKey = 0;
    dramas.forEach(drama => {
        if(firstKey == 0) firstKey = drama.key;
        let pagingDiv = $('<div>').addClass('paging');
        pagingDiv.html(drama.name + '<br>' + drama.time);
        pagingDiv.attr('data-key', drama.key);
        pagingDivAddEvent(pagingDiv);
        $(pagingDiv).appendTo(sidebarDiv);
    });    
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

function getDramasInJson(jsonObj){
    dramas = [];
    // 遍歷 JSON 物件的每個屬性
  for (let key in jsonObj) {
    if(jsonObj.hasOwnProperty(key) == false) continue;
    let item = jsonObj[key];
    if (item.type !== 'drama') continue;
    item.key = key;
    dramas.push(item); // 將符合條件的 drama 物件添加到陣列中
  }
}