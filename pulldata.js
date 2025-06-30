import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, get, update, remove, set, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, getDoc, doc, setDoc, updateDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";




const firebaseConfig = {
    apiKey: "AIzaSyCXJf5d9sCsjzgYLMZ4IcFTBWBg7RLWfMY",
    authDomain: "im1project.firebaseapp.com",
    databaseURL: "https://im1project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "im1project",
    storageBucket: "im1project.firebasestorage.app",
    messagingSenderId: "141105773175",
    appId: "1:141105773175:web:4ce3fb9fcb8b0076262472"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbfirestore = getFirestore(app);


// Logout
const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', logout)



function logout() {

    localStorage.removeItem('LoggedInUser');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error Signing out:', error)
        })
}
// Track Login State
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html?section=login';
        return;
    }

    const uid = user.uid;

    // 🌟 Load user profile
    try {
        const userDocRef = doc(dbfirestore, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
        } else {
            console.log("No user profile found.");
        }
    } catch (error) {
        console.log("Error fetching user profile:", error);
    }

    // 🛒 Load saved cart
    try {
        const cartDocRef = doc(dbfirestore, "carts", uid);
        const cartDocSnap = await getDoc(cartDocRef);

        if (cartDocSnap.exists()) {
            listCards = cartDocSnap.data().items || [];
            reloadCard();
        } else {
            console.log("No cart data found for user.");
        }
    } catch (error) {
        console.log("Error loading cart:", error);
    }
});

function showSection(sectionId) {
    let allSections = document.querySelectorAll('.section');

    allSections.forEach(section => {
        section.classList.add('hidden');
        section.style.display = "none";
    });

    let activeSection = document.getElementById(sectionId);
    activeSection.classList.remove('hidden');
    activeSection.style.display = "block";


}


document.getElementById("nav-home").addEventListener("click", () => {
    showSection("home");
    document.title = 'Home';
});

document.getElementById("nav-service").addEventListener("click", () => {
    showSection("service");
    document.title = 'Services';
});

document.getElementById("nav-order").addEventListener("click", () => {
    showSection("order-now");
    document.title = 'Order Now';
});

document.getElementById("nav-book").addEventListener("click", () => {
    showSection("book-now");
    document.title = 'Book Now';
});

document.getElementById("nav-track").addEventListener("click", () => {
    showSection("track");
    document.title = 'Track your order';
});
document.getElementById("ProfileClick").addEventListener("click", () => {
    window.location.href = "sidebar-menu/profile.html"
    // showSection("Profile");
    // document.title = 'Profile';
    // document.getElementById("logo-container").style.display = "none";
    // document.getElementById("nav-menu").style.display = "none";
});





window.onload = function () {
    showSection('home');
    document.title = 'Home';
};


// Automatically runs after user logs in or on page load
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userRef = doc(dbfirestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            // Check if shortId exists
            if (!userData.shortId) {
                console.log("🕵️ User has no shortId. Creating one...");
                const shortId = await generateUniqueShortId();
                await updateDoc(userRef, { shortId });
                console.log("✨ Assigned new shortId:", shortId);
            } else {
                console.log("✅ Existing shortId:", userData.shortId);
            }
        } else {
            // Firestore doc doesn't exist, create it (legacy account)
            const shortId = await generateUniqueShortId();
            await setDoc(userRef, {
                email: user.email,
                firstname: "",
                lastname: "",
                shortId
            });
            console.log("📘 Created Firestore profile with shortId:", shortId);
        }
    }
});

async function generateUniqueShortId() {
    let shortId;
    let exists = true;

    while (exists) {
        shortId = 'QB' + Math.floor(100000 + Math.random() * 900000);
        const q = query(collection(dbfirestore, "users"), where("shortId", "==", shortId));
        const snapshot = await getDocs(q);
        exists = !snapshot.empty;
    }

    return shortId;
}
