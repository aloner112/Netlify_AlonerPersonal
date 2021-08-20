const playerDataList = document.querySelector('#playerDataList');
const formPlayerData = document.querySelector('#addPlayerData');

/*
function doThingsByRemainder(remainder){

}
*/

function fillPlayersData(doc){

    let div = document.createElement('div');
    div.setAttribute('pId', doc.id);
    // div.style.paddingBottom = '1px';
    div.style.padding = '1px';
    div.style.paddingLeft = '10px';
    div.style.backgroundColor = '#f2f2f2';
    div.style.border = '2px white solid';

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
            let myDiv = document.createElement('div');
            myDiv.style.float = 'left';
            if(remainder == 0) {
                myDiv.style.width = '70px';
                myDiv.style.textAlign = 'center';
            }
            else if(remainder == 1) {
                myDiv.style.width = '30px';
                myDiv.style.textAlign = 'center';
            }
            else {
                myDiv.style.width = '70px';
                myDiv.style.textAlign = 'center';
            }
            myDiv.textContent = teamArray[j];
            if(j < 3){
                td1.style.backgroundColor = '#e6ffff';
                td1.appendChild(myDiv);
                // td1.textContent += teamArray[j] + '\t';
            }else if(j < 6){
                td2.style.backgroundColor = '#ccffff';
                td2.appendChild(myDiv);
                // td2.textContent += teamArray[j] + '\t';
            }else{
                td3.style.backgroundColor = '#99ffff';
                td3.appendChild(myDiv);
                // td3.textContent += teamArray[j] + '\t';
            }
        }
        let tr = document.createElement('tr');
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tableTeams.appendChild(tr);
    }
    let addTeamForm = document.createElement('form');
    addTeamForm.setAttribute('pId', doc.id);

    let man1 = document.createElement('input');
    man1.setAttribute('name', 'man1');
    man1.setAttribute('placeholder', '主將名');
    man1.style.width = '70px';

    let lv1 = document.createElement('input');
    lv1.setAttribute('name', 'lv1');
    lv1.setAttribute('placeholder', '等級');
    lv1.style.width = '32px';

    let kind1 = document.createElement('input');
    kind1.setAttribute('name', 'kind1');
    kind1.setAttribute('placeholder', '主將兵種');
    kind1.style.width = '70px';

    let man2 = document.createElement('input');
    man2.setAttribute('name', 'man2');
    man2.setAttribute('placeholder', '副將1名');
    man2.style.width = '70px';

    let lv2 = document.createElement('input');
    lv2.setAttribute('name', 'lv2');
    lv2.setAttribute('placeholder', '等級');
    lv2.style.width = '32px';

    let kind2 = document.createElement('input');
    kind2.setAttribute('name', 'kind2');
    kind2.setAttribute('placeholder', '副將1兵種');
    kind2.style.width = '70px';

    let man3 = document.createElement('input');
    man3.setAttribute('name', 'man3');
    man3.setAttribute('placeholder', '副將2名');
    man3.style.width = '70px';

    let lv3 = document.createElement('input');
    lv3.setAttribute('name', 'lv3');
    lv3.setAttribute('placeholder', '等級');
    lv3.style.width = '32px';

    let kind3 = document.createElement('input');
    kind3.setAttribute('name', 'kind3');
    kind3.setAttribute('placeholder', '副將2兵種');
    kind3.style.width = '70px';

    let addTeamButton = document.createElement('button');
    addTeamButton.textContent = 'Add Team';

    addTeamForm.appendChild(man1);
    addTeamForm.appendChild(lv1);
    addTeamForm.appendChild(kind1);
    addTeamForm.appendChild(man2);
    addTeamForm.appendChild(lv2);
    addTeamForm.appendChild(kind2);
    addTeamForm.appendChild(man3);
    addTeamForm.appendChild(lv3);
    addTeamForm.appendChild(kind3);
    addTeamForm.appendChild(addTeamButton);

    addTeamForm,addEventListener('submit', (e) =>{
        e.preventDefault();
        // 在 event listener 裡，e.target 就是被按下 submit 的那個 form
        let thisForm = e.target;
        addTeam(
            thisForm.getAttribute('pId'),
            thisForm.man1.value,
            thisForm.lv1.value,
            thisForm.kind1.value,
            thisForm.man2.value,
            thisForm.lv2.value,
            thisForm.kind2.value,
            thisForm.man3.value,
            thisForm.lv3.value,
            thisForm.kind3.value
        );
    })

    div.appendChild(title);
    div.appendChild(pGuild);
    div.appendChild(tableTeams);
    div.appendChild(addTeamForm);
    div.appendChild(pComment);
    playerDataList.appendChild(div);
    /*
    playerDataList.appendChild(title);
    playerDataList.appendChild(pGuild);
    playerDataList.appendChild(pComment);
    */
}

db.collection('PlayerDatas').get().then( snapshot => {
    // console.log(snapshot);
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
})

formPlayerData.addEventListener('submit', (e)=>{
    e.preventDefault();
    db.collection('PlayerDatas').add({
        PlayerName: formPlayerData.PlayerName.value,
        GuildName: formPlayerData.GuildName.value,
        Teams: ['司馬炎,1,soldierA,司馬朗,2,soldierB,司馬師,3,soldierC'],
        Comment: formPlayerData.Comment.value
    }).then( () => {
        window.location.reload();
    })
    /*formPlayerData.PlayerName.value = '';
    formPlayerData.GuildName.value = '';
    formPlayerData.Comment.value = '';*/
})

function addTeam(id, man1, lv1, kind1, man2, lv2, kind2, man3, lv3, kind3){
    let teamContent = man1+','+lv1+','+kind1+','+man2+','+lv2+','+kind2+','+man3+','+lv3+','+kind3;
    db.collection('PlayerDatas').doc(id).then( (playerData) =>{
        let teamsData = playerData.data().Teams;
        teamsData.push(teamContent);
        db.collection('PlayerDatas').doc(id).set({
            Teams: teamsData
        })
    }).then( () =>{
        window.location.reload();
    } )
}
/*
var gotPlayerData = async () => {
    let snapshot = await db.collection('PlayerDatas').get();
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
}
*/


