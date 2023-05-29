//把string格式的yyyy-mm-dd轉換成Date物件
function StringToDate(strDate){
    let parts = strDate.split("-");
    let year = parseInt(parts[0], 10); // 解析年份，parseInt 將字串轉換為數字
    let month = parseInt(parts[1], 10) - 1; // 解析月份，注意月份是以 0 為基底，所以減去 1
    let day = parseInt(parts[2], 10); // 解析日期
    return new Date(year, month, day);
}

//Date to String
function DateToString(date){
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}-${month}-${day}`;
}