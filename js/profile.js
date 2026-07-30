// =====================================
// ChatApp
// profile.js
// Professional Profile System
// =====================================


import { auth, db } from "./firebase.js";


import {

onAuthStateChanged,
signOut

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

doc,
getDoc,
setDoc

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// =====================================
// DOM
// =====================================


const nameInput =
document.getElementById("name");


const photoInput =
document.getElementById("photo");


const saveBtn =
document.getElementById("save");


const preview =
document.getElementById("preview");


const logoutBtn =
document.getElementById("logoutBtn");



let currentUser = null;






// =====================================
// AUTH CHECK
// =====================================


onAuthStateChanged(
auth,
async(user)=>{


    if(!user){

        location.href =
        "login.html";

        return;

    }


    currentUser = user;


    await loadProfile();


});







// =====================================
// LOAD PROFILE
// =====================================


async function loadProfile(){


    try{


        const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );



        const snap =
        await getDoc(userRef);



        if(snap.exists()){


            const data =
            snap.data();



            nameInput.value =
            data.name || "";



            photoInput.value =
            data.photo || "";



            if(preview && data.photo){

                preview.src =
                data.photo;

            }



        }
        else{


            nameInput.value =
            currentUser.displayName || "";



            photoInput.value =
            currentUser.photoURL || "";



        }



    }
    catch(error){


        console.error(
            "Load Profile Error:",
            error
        );


    }


}







// =====================================
// PHOTO PREVIEW
// =====================================


if(photoInput){


photoInput.addEventListener(
"input",
()=>{


    if(preview){


        preview.src =
        photoInput.value
        ||
        "https://via.placeholder.com/120";


    }


});


}








// =====================================
// SAVE PROFILE
// =====================================


if(saveBtn){


saveBtn.addEventListener(
"click",
async()=>{


    const name =
    nameInput.value.trim();


    const photo =
    photoInput.value.trim();



    if(!name){


        alert(
            "Enter Your Name"
        );


        return;


    }



    try{


        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid
            ),

            {

                uid:
                currentUser.uid,


                name:name,


                photo:photo,


                status:
                "Hey there!",


                email:
                currentUser.email,


                updatedAt:
                Date.now()


            },


            {
                merge:true
            }

        );



        alert(
            "Profile Updated Successfully"
        );



    }
    catch(error){


        console.error(
            "Save Error:",
            error
        );


        alert(
            "Profile Save Failed"
        );


    }



});


}







// =====================================
// LOGOUT
// =====================================


if(logoutBtn){


logoutBtn.addEventListener(
"click",
async()=>{


    const ok =
    confirm(
        "Logout from ChatApp?"
    );



    if(!ok)
    return;



    try{


        await signOut(auth);



        location.href =
        "login.html";



    }
    catch(error){


        console.error(
            "Logout Error:",
            error
        );


        alert(
            "Logout Failed"
        );


    }



});


}
