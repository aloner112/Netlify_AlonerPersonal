const playerDataList = document.querySelector('#playerDataList');

function fillPlayersData(doc){
    let playerName = doc.data().PlayerName;
    let guildName = doc.data().GuildName;
    let teams = doc.data().Teams;
    let comment = doc.data().Comment;

    let div = document.createElement('div');
    let title = document.createElement('h3');
    title.textContent = playerName;
    let pGuild = document.createElement('p');
    pGuild.textContent = '公會名：' + guildName;
    let pComment = document.createElement('p');
    pComment.textContent = '備註：' + comment;

    div.appendChild(title);
    div.appendChild(pGuild);
    div.appendChild(pComment);
    playerDataList.appendChild(title);
    playerDataList.appendChild(pGuild);
    playerDataList.appendChild(comment);
}

db.collection('PlayerDatas').get().then( snapshot => {
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
});
/*
var gotPlayerData = async () => {
    let snapshot = await db.collection('PlayerDatas').get();
    snapshot.docs.forEach(doc => {
        fillPlayersData(doc);
    });
}


