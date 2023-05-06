  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
  import { getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      onAuthStateChanged,
      signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyArRwODvp0wTYoK6auatnEorH872xRFdEw",
    authDomain: "aloner-avg-scenario-editor.firebaseapp.com",
    projectId: "aloner-avg-scenario-editor",
    storageBucket: "aloner-avg-scenario-editor.appspot.com",
    messagingSenderId: "941306290489",
    appId: "1:941306290489:web:05c1556e6a4ff1f9ed08e8",
    measurementId: "G-026DDW5KPL"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  const title = document.querySelector('#title');
  // 登錄表單
  const authForm = document.querySelector('#authForm');
  const loggedInUserBlock = document.querySelector('#loggedInUserBlock');
  const btn_LogIn = document.querySelector('#btn_LogIn');
  const btn_SignUp = document.querySelector('#btn_SignUp');
  const btn_LogOut = document.querySelector('#btn_LogOut');
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');
  const userInfo = document.querySelector('#UserInfo');
  const windowWidth = document.querySelector('#windowWidth');
  btn_LogIn.addEventListener('click', async(event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
        // 登錄成功，使用者信息存儲在 userCredential.user 中
        let user = userCredential.user;
        console.log('登錄成功:', userCredential.user);
        alert('登入成功');
        displayUserEmail();
      })
      .catch((error) => {
        // 登錄失敗，請參考 Firebase 文檔查看可能的錯誤原因
        let errorCode = error.code;
        let errorMessage = error.message;
        alert("登入失敗"+"\n"+errorCode + ": " +errorMessage);
        console.error('登入失敗:', error);
      });
  });
  btn_SignUp.addEventListener('click', async(event) => {
    event.preventDefault();
    createUserWithEmailAndPassword(auth, email.value, password.value).then((userCredential)=>{
      // Signed in 
      let user = userCredential.user;
      alert("註冊成功");
      // ...
    })
    .catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      alert("註冊失敗"+"\n"+errorCode + ": " +errorMessage);
      // ..
    });
  });

  btn_LogOut.addEventListener('click', async(event)=>{
    await signOut(auth);
  });

  
  const displayUserEmail = async() =>{
    if(auth.currentUser){
      userInfo.textContent = "當前使用者：" + auth.currentUser.email;
      authForm.style.display = 'none';
      loggedInUserBlock.style.display = 'inline-block';
    }else{
      userInfo.textContent = "未登入";
      authForm.style.display = 'inline-block';
      loggedInUserBlock.style.display = 'none';
    }
  };
  
  auth.onAuthStateChanged(displayUserEmail);

  window.addEventListener('resize', function(){
    windowWidth.textContent = window.innerWidth;
  } )