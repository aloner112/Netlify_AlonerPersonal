  const title = document.querySelector('#title');
  // 登錄表單
  const form = document.querySelector('#authForm');
  form.addEventListener('login', (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    app.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // 登錄成功，使用者信息存儲在 userCredential.user 中
        console.log('登錄成功:', userCredential.user);
        title.textContent = '登入成功'
      })
      .catch((error) => {
        // 登錄失敗，請參考 Firebase 文檔查看可能的錯誤原因
        console.error('登錄失敗:', error);
        title.textContent = '登入失敗'
      });
  });
  form.addEventListener('signup', (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    app.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        title.textContent = '註冊成功'
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        title.textContent = '註冊失敗'
        // ..
      });
  });

  const form2 = document.querySelector('#testTitle');
  form2.addEventListener('#btn_ChangeTitle', (event) => {
    event.preventDefault();
    let txt = title.textContent + 'A';
    title.textContent = 'txt';
  });