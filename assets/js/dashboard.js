// // 🔥 Replace with your Firebase Config
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT_ID.appspot.com",
//     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();

// 📌 Show user info
auth.onAuthStateChanged(user => {
    if (user) {
                document.getElementById("userEmail").innerText = user.email;
        
                // If user logged in via Google, show profile picture
                if (user.photoURL) {
                    document.getElementById("userPhoto").src = user.photoURL;
                    document.getElementById("userPhoto").style.display = "block";
                }
            } else {
                // Redirect to login page if user is not signed in
                window.location.href = "login.html";
            }
});

// 📌 Logout function
function logout() {
    auth.signOut().then(() => {
        alert("Logged Out!");
        window.location.href = "login.html";
    });
}
// 🔥 Replace with your Firebase Config
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT_ID.appspot.com",
//     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();

// // 📌 Show user info
// auth.onAuthStateChanged(user => {
//     if (user) {
//         document.getElementById("userEmail").innerText = user.email;

//         // If user logged in via Google, show profile picture
//         if (user.photoURL) {
//             document.getElementById("userPhoto").src = user.photoURL;
//             document.getElementById("userPhoto").style.display = "block";
//         }
//     } else {
//         // Redirect to login page if user is not signed in
//         window.location.href = "index.html";
//     }
// });

// 📌 Logout function

