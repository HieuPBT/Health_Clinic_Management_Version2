import { initializeApp, FirebaseApp, FirebaseError } from "firebase/app";
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
    Database,
    DatabaseReference,
    remove,
    DataSnapshot,
    Query,
    Unsubscribe
} from "firebase/database";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updatePassword,
    Auth,
    User,
    UserCredential
} from "firebase/auth";
import moment from 'moment';

moment.locale("vi");
type ValueListener = (snapshot: DataSnapshot) => void;
type ChildAddedListener = (snapshot: DataSnapshot) => void;

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app);

export const encodeEmail = (email: string): string => {
    return btoa(email).replace(/\./g, '%2E');
}

export const decodeEmail = (encodedEmail: string): string => {
    const base64Email = encodedEmail.replace(/%2E/g, '.');
    return atob(base64Email);
}

export interface UserData {
    email: string;
    fullName: string;
    avatar: string;
    status: string;
    lastActive: string;
}

export const getChattingUserData = (callback: (assistants: UserData[]) => void, email: string): Unsubscribe => {
    const usersRef: DatabaseReference = ref(database, 'users');
    let chats: string[] = [];
    getMyChattingUser((c) => {
        chats = c;
    }, email);
    console.log(chats, email);

    const listener: ValueListener = (snapshot: DataSnapshot) => {
        const assistants: UserData[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
            const userData = childSnapshot.val() as UserData;
            if (chats.includes(userData.email)) {
                assistants.push(userData);
            }
        });
        callback(assistants);
    };

    const unsubscribe: Unsubscribe = onValue(usersRef, listener);
    return unsubscribe;
};

export const getMyChattingUser = (callback: (chats: string[]) => void, email: string): Unsubscribe => {
    console.log('getMyChattingUser')
    const chatsRef: DatabaseReference = ref(database, 'users/' + encodeEmail(email) + '/chats');

    const listener: ValueListener = (snapshot: DataSnapshot) => {
        const chats: string[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
            const email = childSnapshot.val().email;
            console.log(childSnapshot.val());
            chats.push(email);
        });
        callback(chats);
    };

    const unsubscribe: Unsubscribe = onValue(chatsRef, listener);
    return unsubscribe;
};

export const getChatId = (userEmail: string): string => {
    const user1 = encodeEmail(auth.currentUser!.email!);
    const user2 = encodeEmail(userEmail);
    const chatId = user1 < user2 ? user1 + "_" + user2 : user2 + "_" + user1;
    return chatId;
}

interface Message {
    email: string;
    message: string;
}

export const getMessages = (callback: (messages: Message[]) => void, userEmail: string): () => void => {
    const chatId = getChatId(userEmail);
    const messagesRef = ref(database, 'chats/' + chatId + '/messages');
    const listener = (snapshot: DataSnapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((message) => {
            messages.push(message.val() as Message);
        });
        callback(messages);
    };

    const unsubscribe: Unsubscribe = onValue(messagesRef, listener);
    return unsubscribe;
}

export const messageListener = (callback: (messages: Message[]) => void, userEmail: string): Unsubscribe => {
    const chatId = getChatId(userEmail);
    const messagesRef: DatabaseReference = ref(database, 'chats/' + chatId + '/messages');

    const listener: ChildAddedListener = (snapshot: DataSnapshot) => {
        callback([snapshot.val() as Message]);
    };

    const unsubscribe: Unsubscribe = onChildAdded(messagesRef, listener);
    return unsubscribe;
};

export const chatListener = (callback: (pre: any) => void, userEmail: string): () => void => {
    const chatsRef = ref(database, 'chats');
    const uid = encodeEmail(userEmail);

    const listener = (snapshot: any) => {
        if (snapshot.key!.includes(uid))
            callback((pre: any) => [...pre, getUserInfoByEmail(decodeEmail(snapshot.key!))]);
    };

    const unsubscribe: Unsubscribe = onChildAdded(chatsRef, listener);
    return unsubscribe;
}

export const listenToAllChats = (callback: (message: Message) => void, currentUserEmail: string): Unsubscribe => {
    const encodedCurrentUserEmail = encodeEmail(currentUserEmail);
    console.log(currentUserEmail)
    const chatsRef: DatabaseReference = ref(database, 'chats');

    const chatsListener: ValueListener = (snapshot: DataSnapshot) => {
        snapshot.forEach((childSnapshot: DataSnapshot) => {
            const chatId = childSnapshot.key;
            if (chatId!.includes(encodedCurrentUserEmail)) {
                const messagesRef: DatabaseReference = ref(database, `chats/${chatId}/messages`);

                const messagesListener: ChildAddedListener = (messageSnapshot: DataSnapshot) => {
                    if (messageSnapshot.val().email !== currentUserEmail) {
                        callback(messageSnapshot.val() as Message);
                    }
                };

                onChildAdded(messagesRef, messagesListener);
            }
        });
    };

    const unsubscribe: Unsubscribe = onValue(chatsRef, chatsListener);
    return unsubscribe;
};

export const getUserInfoByEmail = (email: string): Promise<UserData | null> => {
    return new Promise((resolve, reject) => {
        const id = encodeEmail(email);
        const userRef = ref(database, `users/${id}`);
        onValue(userRef, (snapshot: any) => {
            if (snapshot.exists()) {
                resolve(snapshot.val() as UserData);
            } else {
                resolve(null);
            }
        }, reject);
    });
}

interface Notification {
    email: string;
}

export const listenNewNotifications = (email: string, callback: (notification: Notification) => void): () => void => {
    const notiRef = ref(database, 'users/' + encodeEmail(email) + '/notifications');

    const listener = (snapshot: any) => {
        const notification = snapshot.val() as Notification;
        console.log(notification);
        callback(notification);
    };

    const unsubscribe: Unsubscribe = onChildAdded(notiRef, listener);
    return unsubscribe;
};

export const readMessage = (email: string, sender: string): () => void => {
    const notiRef = ref(database, 'users/' + encodeEmail(email) + '/notifications/' + encodeEmail(sender));
    const listener = onValue(notiRef, async (snapshot: any) => {
        if (snapshot.exists()) {
            try {
                await remove(notiRef);
                console.log(`Notification from ${sender} for ${email} removed successfully.`);
            } catch (error) {
                console.error(`Failed to remove notification from ${sender} for ${email}: `, error);
            }
        }
    });


    const unsubscribe: Unsubscribe = onValue(notiRef, listener);
    return unsubscribe;
};

export const sendMessage = async (chatId: string, message: string, email: string, recipient: string): Promise<void> => {
    const stopReadingMessage = readMessage(email, recipient);

    const id = push(child(ref(database), 'chats/' + chatId + '/messages')).key;
    await set(ref(database, 'chats/' + chatId + '/messages/' + id!), {
        email: email,
        message: message
    });

    const notiRef = ref(database, 'users/' + encodeEmail(recipient) + '/notifications/' + encodeEmail(email));
    await set(notiRef, {
        email: email,
    });

    await startChat(email, recipient);
    stopReadingMessage();
};

export const startChat = async (email: string, recipient: string): Promise<void> => {
    let chattingRef = ref(database, 'users/' + encodeEmail(recipient) + '/chats/' + encodeEmail(email));
    await set(chattingRef, {
        email: email,
    });

    chattingRef = ref(database, 'users/' + encodeEmail(email) + '/chats/' + encodeEmail(recipient));
    await set(chattingRef, {
        email: recipient,
    });
};

export const setUserData = (userId: string, data: any): void => {
    const userRef = ref(database, 'users/' + userId);
    set(userRef, { ...data });
};

export const updateUserData = (userId: string, data: any): void => {
    const userRef = ref(database, 'users/' + userId);
    update(userRef, { ...data });
};

export const updatePasswordFirebase = async (newPassword: string): Promise<void> => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("User is not authenticated.");
        }

        await updatePassword(user, newPassword);
        console.log("Password updated successfully.");
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};


export const handleRegisterFirebase = async (email: string, password: string, fullName: string, avatar: string): Promise<void> => {
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

export interface LoginData {
    email: string;
    password: string;
    avatar: string;
    fullName: string;
}

export const handleLoginFirebase = async (email: string, password: string, avatar: string, fullName: string): Promise<void> => {
    console.log(email, password)
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // await updateUserData(encodeEmail(user.email!), {
        //     status: "online",
        //     lastActive: new Date(),
        //     avatar: avatar,
        //     fullName: fullName,
        // });
    } catch (error) {
        if (error instanceof FirebaseError) {
            switch (error.code) {
              case 'auth/invalid-credential':
                console.error('Invalid email or password');
                throw new Error('Invalid email or password');
              case 'auth/user-disabled':
                console.error('This account has been disabled');
                throw new Error('This account has been disabled');
              case 'auth/user-not-found':
                console.error('No user found with this email');
                throw new Error('No user found with this email');
              default:
                console.error('An error occurred during login:', error.message);
                throw error;
            }
          } else {
            console.error('An unexpected error occurred:', error);
            throw error;
          }
    }
};

export const setOffline = (): void => {
    const user = auth.currentUser;
    if (user) {
        updateUserData(encodeEmail(user.email!), {
            status: "offline",
            lastActive: new Date()
        });
    }
};

export { auth, database, ref, set, onValue, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };
