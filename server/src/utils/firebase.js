import { initializeApp } from "firebase/app";
import {
    getDatabase,
    ref,
    set,
    onValue,
    update,
    off,
    push,
    child,
    onChildAdded,
    remove
} from "firebase/database";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updatePassword
} from "firebase/auth";
import moment from 'moment';

moment.locale("vi");

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export const encodeEmail = (email) => {
    return btoa(email).replace(/\./g, '%2E');
}

export const decodeEmail = (encodedEmail) => {
    const base64Email = encodedEmail.replace(/%2E/g, '.');
    return atob(base64Email);
}

const setUserData = (userId, data) => {
    const userRef = ref(database, 'users/' + userId);
    set(userRef, { ...data });
}

export const handleRegisterFirebase = async (email, password, fullName, avatar) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        const uid = encodeEmail(email);
        setUserData(uid, {
            status: "offline",
            lastActive: new Date(),
            email: email,
            avatar: avatar,
            fullName: fullName
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};
