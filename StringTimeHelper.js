//把string格式的yyyy-mm-dd轉換成Date物件
export function StringToDate(strDate){
    let parts = strDate.split(" ");  // 使用空格分割日期與時間
    let dateParts = parts[0].split("-");
    let timeParts = (parts[1] || "00:00:00").split(":");  // 如果没有时间，就默认为 00:00:00

    let year = parseInt(dateParts[0], 10);
    let month = parseInt(dateParts[1], 10) - 1;
    let day = parseInt(dateParts[2], 10);

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;  // 如果任何一部分不能被正确地解析为数字，那么返回 null
    }

    return new Date(year, month, day, hours, minutes, seconds);
}

//Date to String
export function DateToString(date){
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}