import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import {
    getAuth, sendPasswordResetEmail, browserLocalPersistence,
    browserSessionPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, updateDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


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
const db = getDatabase(app);
const auth = getAuth(app);
const dbfirestore = getFirestore(app);

onAuthStateChanged(auth, user => {
    if (user) {

        setTimeout(() => {
            window.location.href = 'userhomepage.html';
            return;
        }, 2000);

    }


    const LoggedInUser = localStorage.getItem('LoggedInUser')
    if (LoggedInUser) {
        const docRef = doc(dbfirestore, "users", LoggedInUser);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // document.getElementById('UserFirstName').innerText = userData.firstname;
                    // document.getElementById('UserLastName').innerText = userData.lastname;
                    document.getElementById('UserEmail').innerText = userData.email
                    // .slice(0, 6) + '...';

                }
                else {
                    showMessage('Error', 'error')
                    console.log("No document matched with the id")
                }

            })
            .catch(error => {
                console.log(error);
            })
    }
});



function showStatus(status, divId) {
    var statusDiv = document.getElementById(divId);
    statusDiv.style.display = "block";
    statusDiv.innerHTML = status;
    statusDiv.style.opacity = 1;
    setTimeout(function () {
        statusDiv.style.opacity = 1;
    }, 5000);
}

function showSection(sectionId) {
    let allSections = document.querySelectorAll('.section');

    allSections.forEach(section => {
        section.classList.add('hidden');
        section.style.display = "none";
    });

    let activeSection = document.getElementById(sectionId);
    activeSection.classList.remove('hidden');
    activeSection.style.display = "flex";


}

window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') || 'login'; // default to login

    showSection(section);
};


const registerHere = document.getElementById("register-here")
const loginHere = document.getElementById("login-here")


registerHere.addEventListener("click", () => {
    showSection('register');
});

loginHere.addEventListener("click", () => {
    showSection('login');
});

const signup = document.getElementById("register-button")
signup.addEventListener("click", (event) => {
    event.preventDefault();
});



// Sign Up
// Get input elements
const firstname_input = document.getElementById('fName');
const lastname_input = document.getElementById('lName');
const email_input_register = document.getElementById('register-email');
const password_input_register = document.getElementById('register-password');
const repeat_password_input = document.getElementById('repeat-password');
const error_message_register = document.getElementById('register-status'); // Ensure this element exists
const submit_register = document.getElementById('register-button');
const checkbox_agree = document.getElementById('checkbox-click-agree');
const agreebox = document.getElementById('checkmark');

submit_register.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const email = email_input_register.value.trim();
    const password = password_input_register.value.trim();
    const firstname = firstname_input.value.trim();
    const lastname = lastname_input.value.trim();
    const repeat_password = repeat_password_input.value.trim();
    const agree = checkbox_agree.checked;

    let shortId;
    shortId = 'QB' + Math.floor(100000 + Math.random() * 900000);


    let errors = 0;

    // Validate inputs
    errors = getSignupFormErrors(firstname, lastname, email, password, repeat_password, agree);

    if (errors.length > 0) {
        // If there are any errors
        // error_message_register.innerText = errors.join(". ");
    } else {
        let user;

        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                const userData = {
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    shortId: shortId
                };

                showMessage('Account created successfully!', 'success');
                const docRef = doc(dbfirestore, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        setTimeout(() => {
                            showSection('login');
                        }, 2000); // 2000ms = 2 seconds
                    });

            })
            .catch(async (error) => {
                if (user) {
                    try {
                        await user.delete();
                        console.error("Firestore write failed, user deleted from auth.");
                        showMessage('Error', 'error')
                    } catch (deletionError) {
                        console.error("Error deleting user:", deletionError);
                        showMessage('Error', 'error')
                    }
                }
                const errorCode = error.code;

                if (errorCode === 'auth/invalid-email') {
                    showMessage('Incorrect Email', 'error');
                } else if (errorCode === 'auth/email-already-in-use') {
                    showMessage('This email is already registered.', 'error');
                } else if (errorCode === 'auth/weak-password') {
                    showMessage('Password must be at least 6 characters.', 'error');
                } else {
                    showMessage('Signup failed. Please try again.', 'error');
                    console.log(errorCode)
                }


            });
    }
})

function getSignupFormErrors(firstname, lastname, email, password, repeat_password, agree) {
    let errors = [];

    if (!firstname) {
        // errors.push('Firstname is required');
        firstname_input.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Firstname is required', 'error');
        return ['Firstname is required'];

    }
    if (!lastname) {
        // errors.push('Lastname is required');
        lastname_input.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Lastname is required', 'error');
        return ['Lastname is required'];

    }
    if (!email) {
        // errors.push('Email is required');
        email_input_register.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Email is required', 'error');
        return;
    }
    if (!password) {
        // errors.push('Password is required');
        password_input_register.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Password is required', 'error');
        return;
    }
    if (password.length < 8) {
        // errors.push('Password must have at least 8 characters');
        password_input_register.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Password must have at least 8 characters', 'error');
        return;
    }
    if (password !== repeat_password) {
        // errors.push('Password does not match repeated password');
        password_input_register.parentElement.classList.add('incorrect');
        repeat_password_input.parentElement.classList.add('incorrect');
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('Password does not match repeated password', 'error');
        return;
    }

    if (!agree) {
        // errors.push('The terms of service & privacy policy must be accepted.');
        agreebox.parentElement.classList.add("incorrect"); // Optional styling
        error_message_register.parentElement.classList.add('bad-warning');
        showMessage('The terms of service & privacy policy must be accepted.', 'error');
        return;
    }

    return errors;
}

// Clear error messages on input
const allInputsRegister = [firstname_input, lastname_input, email_input_register, password_input_register, repeat_password_input].filter(input => input != null);

allInputsRegister.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            error_message_register.innerText = '';
        }
    });
});

// 🌟 UI Elements
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const errorMessage = document.getElementById("login-status");
const signinButton = document.getElementById("login-button");


signinButton.addEventListener("click", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById("checkbox-click-remember-password").checked;

    // const errors = getLoginFormErrors(email, password);

    // if (errors.length > 0) {
    //     // If there are any errors
    //     // errorMessage.innerText = errors.join(". ");
    //     return;
    // }

    const hasError = getLoginFormErrors(email, password);
    if (hasError) return; // 🛑 stop everything here

    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    setPersistence(auth, persistence)
        .then(() => {
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then(userCredential => {
            showMessage('Login Successfully!', 'success');
            const user = userCredential.user;
            setTimeout(() => {
                localStorage.setItem('LoggedInUser', user.uid);
                window.location.href = 'userhomepage.html'
            }, 4000);

        })
        .catch(error => {
            const errorCode = error.code;

            if (errorCode === 'auth/invalid-login-credentials') {
                showMessage('Incorrect Email or Password', 'error');
            } else if (errorCode === 'auth/invalid-email') {
                showMessage('Invalid email format', 'error');
            } else if (errorCode === 'auth/user-disabled') {
                showMessage('This account has been disabled.', 'error');
            } else if (errorCode === 'auth/user-not-found') {
                showMessage('Account does not exist.', 'error');
            } else if (errorCode === 'auth/too-many-requests') {
                showMessage('Too many attempts. Please wait and try again.', 'error');
            } else if (errorCode === 'auth/network-request-failed') {
                showMessage('Network error. Please check your connection.', 'error');
            } else {
                showMessage('Something went wrong. Please try again.', 'error');
                console.log(errorCode);
            }
        });

}
);
const resetPasswordButton = document.getElementById("reset-password-button");
const emailReset = document.getElementById("reset-password-email");
const forgotPasswordLink = document.getElementById("forgot-password");
const goBackLogin = document.getElementById("go-back-login");

goBackLogin.addEventListener("click", () => {
    showSection('login')
})

resetPasswordButton.addEventListener("click", () => {
    const email = emailReset.value.trim();
    if (!email) {
        // errors.push('Email is required');
        emailReset.parentElement.classList.add('incorrect');
        errorMessage.parentElement.classList.add('bad-warning');
        showMessage('Email is required', 'error');
        return;
    }
    async function sendResetIfEmailExists(email) {
        const usersRef = collection(dbfirestore, "users");
        const q = query(usersRef, where("email", "==", email.toLowerCase()));
        const snapshot = await getDocs(q);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        if (snapshot.empty) {
            showMessage('This email is not registered.', 'error');
            return;
        }

        // Email exists in Firestore — proceed to send reset email
        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('Password reset email sent! Check your inbox or spam folder.', 'success');
                document.getElementById('reset-status').parentElement.classList.add('good-warning');
                showStatus('Password reset email sent! Check your inbox or spam folder.', 'reset-status')

            })
            .catch((error) => {
                const code = error.code;
                if (code === 'auth/user-not-found') {
                    showMessage('No Firebase Auth account found with this email.', 'error');
                    console.error(code);
                } else if (code === 'auth/invalid-email') {
                    showMessage('Invalid email address format.', 'error');
                    console.error(code);
                } else {
                    showMessage('Something went wrong. Please try again later.', 'error');
                    console.error(code);
                }
            });
    }
    sendResetIfEmailExists(emailReset.value.trim());
});

const allInputsReset = [emailReset].filter(input => input != null);

allInputsReset.forEach(input => {
    input.addEventListener("input", () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            errorMessage.innerText = ''; // Clear the error message
        }
    });

});

forgotPasswordLink.addEventListener("click", (event) => {
    event.preventDefault();

    const email = emailReset.value.trim();


    // if (!email) {
    //     showMessage('Please enter your email first.', 'error');
    //     emailInput.focus();
    //     return;
    // }

    window.location.href = 'login.html?section=reset-password'


});


function getLoginFormErrors(email, password) {
    let errors = [];

    if (!password && !email) {
        passwordInput.parentElement.classList.add('incorrect');
        emailInput.parentElement.classList.add('incorrect');
        errorMessage.parentElement.classList.add('bad-warning');
        showMessage('Email & Password is required', 'error');
        return true;
    }
    if (!email) {
        // errors.push('Email is required');
        emailInput.parentElement.classList.add('incorrect');
        errorMessage.parentElement.classList.add('bad-warning');
        showMessage('Email is required', 'error');
        return true;
    }
    if (!password) {
        // errors.push('Password is required');
        passwordInput.parentElement.classList.add('incorrect');
        errorMessage.parentElement.classList.add('bad-warning');
        showMessage('Password is required', 'error');
        return true;
    }


    return false;
}

const allInputs = [emailInput, passwordInput].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener("input", () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            errorMessage.innerText = ''; // Clear the error message
        }
    });
});




// show error message pop up
function showMessage(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
