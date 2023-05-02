// 初始化 Firebase 應用程序
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  
  // 登錄表單
  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
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