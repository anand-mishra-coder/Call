import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getDatabase
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUCBYQ7vZir4LdXq_EFgQCP6Njaf8iZDE",
    authDomain: "chatapp-b26fa.firebaseapp.com",

    databaseURL: "https://chatapp-b26fa-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "chatapp-b26fa",
    storageBucket: "chatapp-b26fa.firebasestorage.app",
    messagingSenderId: "213294554621",
    appId: "1:213294554621:web:78e8c70dd4cca38bf80d94",
    measurementId: "G-T3F308VXMH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);