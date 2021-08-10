const playerDataList = document.querySelector('#playerDataList');

/*
function doThingsByRemainder(remainder){

}
*/

function fillPlayersData(doc){
    
    let div = document.createElement('div');
    /*
    let pId = document.createElement('p');
    pId.textContent = 'id = ' + doc.id;
    playerDataList.appendChild(pId);
    */
    
    let playerName = doc.data().PlayerName;
    let guildName = doc.data().GuildName;
    let teams = doc.data().Teams;
    let comment = doc.data().Comment;

    let title = document.createElement('h2');
    title.textContent = playerName;
    let pGuild = document.createElement('p');
    pGuild.textContent = '公會名：' + guildName;
    let pComment = document.createElement('p');
    pComment.textContent = '備註：' + comment;

    let pTeams = document.createElement('p');
    pTeams.textContent = teams;

    let tableTeams = document.createElement('table');
    let teamAmount = teams.length;
    for(let i = 0; i < teamAmount; i++){
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        td1.textContent = '';
        td2.textContent = '';
        td3.textContent = '';

        let teamArray = teams[i].split(',');
        for(let j = 0; j < teamArray.length; j++){
            let remainder = j%3;
            if(j < 3){
                td1.textContent += teamArray[j] + '\t';
            }else if(j < 6){
                td2.textContent += teamArray[j] + '\t';
            }else{
                td3.textContent += teamArray[j] + '\t';
            }
        }
        let tr = document.createElement('tr');
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tableTeams.appendChild(tr);
    }

    div.appendChild(title);
    div.appendChild(pGuild);
    div.appendChild(tableTeams);
    div.appendChild(pComment);
    playerDataList.appendChild(div);
    /*
    playerDataList.appendChild(title);
    playerDataList.appendChild(pGuild);
    playerDataList.appendChild(pComment);
    */
}

db.collection('PlayerDatas').get().then( snapshot => {
    console.log(snapshot);
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
})
/*
var gotPlayerData = async () => {
    let snapshot = await db.collection('PlayerDatas').get();
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
}
*/


