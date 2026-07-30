let btn =
document.getElementById("themeBtn");


btn.onclick=()=>{


document.body
.classList.toggle("dark");


localStorage.setItem(

"theme",

document.body.className

);


};



if(localStorage.getItem("theme")){


document.body.className =
localStorage.getItem("theme");


}