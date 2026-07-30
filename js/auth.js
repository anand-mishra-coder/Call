import {auth,db}
from "./firebase.js";


import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut

}
from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

doc,
setDoc,
serverTimestamp

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// SIGNUP

const signupBtn =
document.getElementById("signup");


if(signupBtn){


signupBtn.onclick = async()=>{


let name =
document.getElementById("name").value;


let email =
document.getElementById("email").value;


let password =
document.getElementById("password").value;



try{


const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);



const user =
userCredential.user;



await setDoc(
doc(db,"users",user.uid),
{

uid:user.uid,

name:name,

email:email,

photo:"",

status:"Hey there! I am using ChatApp",

createdAt:serverTimestamp()

}

);



alert("Account Created");


location.href="chat.html";


}

catch(error){

alert(error.message);

}


};


}



// LOGIN


const loginBtn =
document.getElementById("login");


if(loginBtn){


loginBtn.onclick=async()=>{


let email =
document.getElementById("email").value;


let password =
document.getElementById("password").value;



try{


await signInWithEmailAndPassword(
auth,
email,
password
);



location.href="chat.html";


}

catch(error){

alert(error.message);

}



};


}



// CHECK LOGIN


onAuthStateChanged(
auth,
(user)=>{


if(user){

console.log(
"Logged in:",
user.email
);


}


});
