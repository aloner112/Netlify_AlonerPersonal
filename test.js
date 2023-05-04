const title = document.querySelector('#title');
const form2 = document.querySelector('#testTitle');
const button = document.querySelector('#btn_ChangeTitle');
button.addEventListener('click', (event) => {
    event.preventDefault();
    //let txt = title.textContent + 'A';
    title.textContent = "txt";
});