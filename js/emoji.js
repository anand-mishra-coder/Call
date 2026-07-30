const emojis=[

"😀","😂","😍","😎",
"👍","❤️","🔥","🎉",
"🙏","😭","😡","🥳"

];


let box=
document.getElementById("emojiBox");


emojis.forEach(e=>{


let btn=
document.createElement("button");


btn.innerText=e;


btn.onclick=()=>{


document
.getElementById("messageInput")
.value += e;


};


box.appendChild(btn);


});
