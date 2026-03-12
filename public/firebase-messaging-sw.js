importScripts("https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAKZ0uzohxoERpxzjz3VkNG2RTW75oY9WY",
  authDomain: "cerbero-push.firebaseapp.com",
  projectId: "cerbero-push",
  storageBucket: "cerbero-push.firebasestorage.app",
  messagingSenderId: "252052401751",
  appId: "1:252052401751:web:fa7af060efd416d037bd12",
});

const messaging = firebase.messaging();