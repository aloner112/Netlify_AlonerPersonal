// 初始化 Firebase 應用程序
const firebaseConfig = {
  apiKey: "AIzaSyArRwODvp0wTYoK6auatnEorH872xRFdEw",
  authDomain: "aloner-avg-scenario-editor.firebaseapp.com",
  projectId: "aloner-avg-scenario-editor",
  storageBucket: "aloner-avg-scenario-editor.appspot.com",
  messagingSenderId: "941306290489",
  appId: "1:941306290489:web:05c1556e6a4ff1f9ed08e8",
  measurementId: "G-026DDW5KPL"
  };
  firebase.initializeApp(firebaseConfig);
  
  // 登錄表單
  const form = document.querySelector('#authForm');
  form.addEventListener('login', (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // 登錄成功，使用者信息存儲在 userCredential.user 中
        console.log('登錄成功:', userCredential.user);
      })
      .catch((error) => {
        // 登錄失敗，請參考 Firebase 文檔查看可能的錯誤原因
        console.error('登錄失敗:', error);
      });
  });
  form.addEventListener('signup', (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });
  });