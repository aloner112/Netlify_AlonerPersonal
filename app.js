db.collection('PlayerDatas').get().then( (snapshot) => {
    console.log(snapshot.docs);
});