import firebase from "firebase/app";
import 'firebase/storage';
import "firebase/auth";
import "firebase/firestore";

var firebaseConfig = {
    apiKey: "AIzaSyC3ib0bJGWBrCaD06RWDp_Xs_uov57WQ9k",
    authDomain: "geopromote-c98a8.firebaseapp.com",
    projectId: "geopromote-c98a8",
    storageBucket: "geopromote-c98a8.appspot.com",
    messagingSenderId: "548290951480",
    appId: "1:548290951480:web:35eb19949013880f6629cd",
    measurementId: "G-ZYT4FQEEHW"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const geopointfirestore = firebase.firestore;