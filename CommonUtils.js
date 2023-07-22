

export function InputFindMatchData(inputDOM, dataParentObj, propName){
    if(dataParentObj === undefined){return;}
    let _inputDOM = $(inputDOM);
    let inputValue = _inputDOM.val();
    let filteredNames = Object.values(dataParentObj)
        .map(data => data[propName] || '')
        .filter(prop => prop !== '')
        .filter(prop => prop.toLowerCase().startsWith((inputValue.toLowerCase())));
    
    $('#nameList').remove();
    if(filteredNames.length > 0){
        let nameList = $('<div>').attr('id', 'nameList');
        filteredNames.forEach(name =>{
           let listItem = $('<div>').addClass('nameListName')
               .text(name).on('click', function(){
             _inputDOM.val(name);
             $('#nameList').remove();
           });
           nameList.append(listItem);
        });
        _inputDOM.after(nameList);
    }
} 