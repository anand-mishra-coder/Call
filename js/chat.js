// =====================================
// ChatApp
// chat.js
// P1.1 - Imports & Variables
// =====================================

import { auth, db, rtdb } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================
// Global Variables
// =====================================

let currentUser = null;
let selectedUser = null;
let currentChatId = null;
let replyMessage = null;


// =====================================
// DOM Elements
// =====================================

const usersBox = document.getElementById("users");
const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiBox = document.getElementById("emojiBox");
const typingBox = document.getElementById("typing");
const chatUser = document.getElementById("chatUser");
const userStatus = document.getElementById("userStatus");
const searchInput = document.getElementById("searchUser");
const logoutBtn = document.getElementById("logoutBtn");
const replyBox = document.getElementById("replyBox");
const replyText = document.getElementById("replyText");
const cancelReply = document.getElementById("cancelReply");



// =====================================
// P1.2
// Login Check + Online Status + Logout
// =====================================

// Login Check
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    try {

        await setOnlineStatus();

        loadUsers();

    } catch (error) {

        console.error("Startup Error:", error);

    }

});


// =====================================
// Set Online Status
// =====================================

async function setOnlineStatus() {

    if (!currentUser) return;

    try {

        await set(
            ref(rtdb, "status/" + currentUser.uid),
            {
                online: true,
                lastSeen: Date.now()
            }
        );

    } catch (error) {

        console.error("Status Error:", error);

    }

}


// =====================================
// Set Offline Status
// =====================================

async function setOfflineStatus() {

    if (!currentUser) return;

    try {

        await set(
            ref(rtdb, "status/" + currentUser.uid),
            {
                online: false,
                lastSeen: Date.now()
            }
        );

    } catch (error) {

        console.error("Offline Error:", error);

    }

}


// =====================================
// Logout
// =====================================

logoutBtn.addEventListener("click", async () => {

    const ok = confirm("Logout from ChatApp?");

    if (!ok) return;

    try {

        await setOfflineStatus();

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout Error:", error);

        alert("Logout Failed!");

    }

});


// =====================================
// Close Tab / Refresh
// =====================================

window.addEventListener("beforeunload", () => {

    if (!currentUser) return;

    set(
        ref(rtdb, "status/" + currentUser.uid),
        {
            online: false,
            lastSeen: Date.now()
        }
    );

});
// =====================================
// P1.3
// Load Users
// =====================================


async function loadUsers(){

    if(!usersBox) return;


    try{


        const snap = await getDocs(
            collection(db,"users")
        );


        usersBox.innerHTML = "";


        snap.forEach((userDoc)=>{


            const user = userDoc.data();



            // Hide Current User
            if(user.uid === currentUser.uid)
            return;



            const div = document.createElement("div");


            div.className = "user";



            const photo =
            user.photo ||
            "https://ui-avatars.com/api/?name="
            +
            encodeURIComponent(
                user.name || "User"
            );



            div.innerHTML = `

                <div class="user-item">


                    <img 
                    src="${photo}"
                    class="user-photo">


                    <div class="user-info">

                        <b>
                        ${user.name || "Unknown"}
                        </b>


                        <small>
                        ${user.status || "Hey there!"}
                        </small>

                    </div>


                </div>

            `;



            // Select User

            div.addEventListener(
                "click",
                ()=>{


                    selectedUser = user;


                    currentChatId =
                    [
                        currentUser.uid,
                        user.uid
                    ]
                    .sort()
                    .join("_");



                    chatUser.innerText =
                    user.name;



                    showUserStatus(
                        user.uid
                    );


                    loadMessages();


                    listenTyping();


                }
            );



            usersBox.appendChild(div);



        });



    }
    catch(error){

        console.error(
            "Load Users Error:",
            error
        );

    }


}
// =====================================
// P2.1
// Search Users + User Status
// =====================================



// =====================================
// Search User
// =====================================

if(searchInput){

    searchInput.addEventListener(
        "input",
        ()=>{


            const value =
            searchInput.value
            .toLowerCase()
            .trim();



            document
            .querySelectorAll(".user")
            .forEach((user)=>{


                const text =
                user.innerText
                .toLowerCase();



                if(
                    text.includes(value)
                ){

                    user.style.display =
                    "block";

                }
                else{

                    user.style.display =
                    "none";

                }


            });


        }
    );

}





// =====================================
// Show Selected User Status
// =====================================


function showUserStatus(uid){


    if(!userStatus)
    return;



    onValue(

        ref(
            rtdb,
            "status/" + uid
        ),


        (snapshot)=>{


            const data =
            snapshot.val();



            if(!data){


                userStatus.innerText =
                "Offline";


                return;

            }





            if(data.online){


                userStatus.innerText =
                "Online";


            }
            else if(data.lastSeen){


                const last =
                new Date(
                    data.lastSeen
                );



                userStatus.innerText =
                "Last seen "
                +
                last.toLocaleString();



            }
            else{


                userStatus.innerText =
                "Offline";


            }



        }


    );


}
// =====================================
// P2.2
// Send Message System
// =====================================


// Send Button

if(sendBtn){

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}



// Enter Key Send

if(messageInput){

    messageInput.addEventListener(
        "keydown",
        (e)=>{


            if(e.key === "Enter"){

                sendMessage();

            }


        }
    );

}




// =====================================
// Send Message Function
// =====================================


async function sendMessage(){


    if(
        !currentUser ||
        !selectedUser ||
        !currentChatId
    ){

        return;

    }



    const text =
    messageInput.value
    .trim();



    if(!text){

        return;

    }



    try{


        await addDoc(

            collection(
                db,
                "chats",
                currentChatId,
                "messages"
            ),


            {

                text:text,

                sender:
                currentUser.uid,


                time:
                serverTimestamp(),


                seen:false,


                delivered:true,


                reply:
                replyMessage || ""

            }


        );



        // Clear Input

        messageInput.value = "";



        // Clear Reply

        replyMessage = null;



        if(replyBox){

            replyBox.style.display =
            "none";

        }



        if(replyText){

            replyText.innerText =
            "";

        }



    }
    catch(error){


        console.error(
            "Send Message Error:",
            error
        );


    }



}
// =====================================
// P2.3
// Load Messages + Seen System
// =====================================


function loadMessages(){


    if(!currentChatId)
    return;



    const q = query(

        collection(
            db,
            "chats",
            currentChatId,
            "messages"
        ),

        orderBy("time")

    );



    onSnapshot(q,(snapshot)=>{


        if(!messagesBox)
        return;



        messagesBox.innerHTML = "";



        snapshot.forEach(
        async(messageDoc)=>{


            const msg =
            messageDoc.data();



            const div =
            document.createElement("div");



            div.className =
            "message";



            if(
                msg.sender === currentUser.uid
            ){

                div.classList.add(
                    "my-message"
                );

            }
            else{

                div.classList.add(
                    "other-message"
                );

            }





            let time = "";

            if(msg.time){

                time =
                msg.time
                .toDate()
                .toLocaleTimeString(
                    [],
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                );

            }





            let seenStatus = "";

            if(
                msg.sender === currentUser.uid
            ){

                seenStatus =
                msg.seen
                ?
                "✓✓"
                :
                "✓";

            }




            div.innerHTML = `

                ${
                    msg.reply
                    ?
                    `
                    <div class="reply-preview">
                        ${msg.reply}
                    </div>
                    `
                    :
                    ""
                }


                <span>
                    ${msg.text}
                </span>


                <small class="time">

                    ${time}
                    ${seenStatus}

                </small>


            `;




            // Double Click Reply

            div.addEventListener(
                "dblclick",
                ()=>{


                    replyMessage =
                    msg.text;


                    if(replyBox){

                        replyBox.style.display =
                        "flex";

                    }


                    if(replyText){

                        replyText.innerText =
                        msg.text;

                    }


                }
            );





            // Long Press Delete

            div.addEventListener(
                "contextmenu",
                async(e)=>{


                    e.preventDefault();



                    if(
                        msg.sender === currentUser.uid
                    ){

                        const ok =
                        confirm(
                        "Delete message?"
                        );


                        if(ok){


                            await deleteDoc(

                                doc(

                                    db,

                                    "chats",

                                    currentChatId,

                                    "messages",

                                    messageDoc.id

                                )

                            );


                        }

                    }


                }
            );





            messagesBox.appendChild(div);





            // Mark Seen

            if(

                msg.sender !== currentUser.uid
                &&
                !msg.seen

            ){


                await updateDoc(

                    doc(

                        db,

                        "chats",

                        currentChatId,

                        "messages",

                        messageDoc.id

                    ),


                    {

                        seen:true

                    }

                );


            }




        });



        messagesBox.scrollTop =
        messagesBox.scrollHeight;



    });


}
// =====================================
// P3.1
// Typing Indicator + Reply Cancel
// =====================================



// =====================================
// Typing System
// =====================================


if(messageInput){


messageInput.addEventListener(
"input",
()=>{


    if(
        !currentUser ||
        !selectedUser
    ){

        return;

    }



    const typingRef = ref(

        rtdb,

        "typing/"
        +
        selectedUser.uid
        +
        "/"
        +
        currentUser.uid

    );



    set(

        typingRef,

        {

            typing:true

        }

    );



    clearTimeout(
        window.typingTimer
    );



    window.typingTimer =
    setTimeout(()=>{


        set(

            typingRef,

            {

                typing:false

            }

        );


    },1000);



});


}







// =====================================
// Listen Typing
// =====================================


function listenTyping(){


    if(
        !selectedUser
    )
    return;



    const typingRef = ref(

        rtdb,

        "typing/"
        +
        currentUser.uid
        +
        "/"
        +
        selectedUser.uid

    );




    onValue(

        typingRef,

        (snapshot)=>{


            const data =
            snapshot.val();



            if(typingBox){


                typingBox.innerText =
                data?.typing
                ?
                "typing..."
                :
                "";

            }



        }

    );


}







// =====================================
// Cancel Reply
// =====================================


if(cancelReply){


cancelReply.addEventListener(
"click",
()=>{


    replyMessage = null;



    if(replyBox){

        replyBox.style.display =
        "none";

    }



    if(replyText){

        replyText.innerText =
        "";

    }



});


}
// =====================================
// P3.2
// Emoji + Reactions + Copy
// =====================================



// =====================================
// Emoji System
// =====================================


const emojis = [
    "😀",
    "😂",
    "😍",
    "😎",
    "👍",
    "❤️",
    "🔥",
    "😢",
    "😮",
    "🙏"
];



if(emojiBox){


    emojiBox.innerHTML = "";



    emojis.forEach((emoji)=>{


        const span =
        document.createElement("span");



        span.innerText =
        emoji;



        span.style.cursor =
        "pointer";



        span.style.fontSize =
        "24px";



        span.style.margin =
        "5px";



        span.onclick = ()=>{


            if(messageInput){


                messageInput.value += emoji;


                messageInput.focus();


            }


        };



        emojiBox.appendChild(span);


    });


}







// Emoji Button Toggle


if(emojiBtn){


emojiBtn.addEventListener(
"click",
()=>{


    if(
        emojiBox.style.display ===
        "block"
    ){

        emojiBox.style.display =
        "none";


    }
    else{


        emojiBox.style.display =
        "block";


    }


});


}







// =====================================
// Copy Message
// =====================================


function copyMessage(text){


    navigator.clipboard
    .writeText(text)
    .then(()=>{


        console.log(
            "Message copied"
        );


    })
    .catch((error)=>{


        console.error(
            "Copy Error:",
            error
        );


    });


}







// =====================================
// Reaction System
// =====================================


function addReactionBox(div){



    const reactionDiv =
    document.createElement("div");



    reactionDiv.className =
    "reaction-box";



    const reactionList = [

        "👍",
        "❤️",
        "😂",
        "😮",
        "😢"

    ];



    reactionList.forEach((reaction)=>{


        const btn =
        document.createElement("span");



        btn.innerText =
        reaction;



        btn.style.cursor =
        "pointer";



        btn.onclick = ()=>{


            reactionDiv.innerHTML =
            reaction;


        };



        reactionDiv.appendChild(btn);



    });



    div.appendChild(
        reactionDiv
    );


}
// =====================================
// P3.3
// Cleanup + Safety Fixes
// =====================================


// =====================================
// Safe Element Checker
// =====================================

function exists(element){

    return element !== null 
    && element !== undefined;

}




// =====================================
// Add Reaction To Message
// =====================================

function setupMessageReaction(messageDiv){


    const reactionBox =
    document.createElement("div");


    reactionBox.className =
    "reaction-box";



    const reactions = [
        "👍",
        "❤️",
        "😂",
        "😮",
        "😢"
    ];



    reactions.forEach((emoji)=>{


        const button =
        document.createElement("span");



        button.innerText =
        emoji;



        button.onclick = ()=>{


            reactionBox.innerHTML =
            emoji;


        };



        reactionBox.appendChild(button);


    });



    messageDiv.appendChild(
        reactionBox
    );


}






// =====================================
// Hide Emoji When Click Outside
// =====================================


document.addEventListener(
"click",
(e)=>{


    if(
        exists(emojiBox)
        &&
        exists(emojiBtn)
    ){


        if(
            !emojiBox.contains(e.target)
            &&
            !emojiBtn.contains(e.target)
        ){

            emojiBox.style.display =
            "none";

        }


    }


});






// =====================================
// Network Error Handler
// =====================================


window.addEventListener(
"online",
()=>{

    console.log(
        "Internet Connected"
    );

});


window.addEventListener(
"offline",
()=>{

    console.log(
        "Internet Disconnected"
    );

});






// =====================================
// Auto Offline On Close
// =====================================


window.addEventListener(
"beforeunload",
()=>{


    if(currentUser){


        set(

            ref(
                rtdb,
                "status/"
                +
                currentUser.uid
            ),

            {

                online:false,

                lastSeen:
                Date.now()

            }

        );


    }


});
