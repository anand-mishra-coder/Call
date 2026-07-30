
import {auth,rtdb}
from "./firebase.js";


import {

onAuthStateChanged

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

ref,
set,
onDisconnect,
serverTimestamp

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";




onAuthStateChanged(auth,(user)=>{


if(user){


let statusRef =
ref(
rtdb,
"status/"+user.uid
);



set(statusRef,{

online:true,
lastSeen:serverTimestamp()

});



// Internet disconnect hone par

onDisconnect(statusRef)
.set({

online:false,

lastSeen:serverTimestamp()

});


}


});
