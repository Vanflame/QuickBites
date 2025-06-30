// cart.js - Firebase cart logic using global Firebase CDN

const firebaseConfig = {
    apiKey: "AIzaSyCXJf5d9sCsjzgYLMZ4IcFTBWBg7RLWfMY",
    authDomain: "im1project.firebaseapp.com",
    projectId: "im1project",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const dbfirestore = firebase.firestore();


const products = [
    { id: 1, name: 'QB Big Burger', image: '1.PNG', price: 45, category: 'Main meals' },
    { id: 2, name: 'QB Chicken Bucket', image: '2.PNG', price: 90, category: 'Main meals' },
    { id: 3, name: 'QB Cheesy Bacon Dog', image: '3.PNG', price: 50, category: 'Main meals' },
    { id: 4, name: 'QB Chili Mac Supreme', image: '4.PNG', price: 55, category: 'Main meals' },
    { id: 5, name: 'QB Fish Fillet Sandwich', image: '5.PNG', price: 50, category: 'Main meals' },
    { id: 6, name: 'QB Liempo Rice Bowl', image: '6.PNG', price: 60, category: 'Main meals' },
    { id: 7, name: 'QB Fries', image: '7.PNG', price: 30, category: 'Sides & Snacks' },
    { id: 8, name: 'QB Loaded Nacho Bites', image: '8.PNG', price: 40, category: 'Sides & Snacks' },
    { id: 9, name: 'QB Turon Twists', image: '9.PNG', price: 40, category: 'Sides & Snacks' },
    { id: 10, name: 'QB Choco Lava Cake', image: '10.PNG', price: 45, category: 'Desserts' },
    { id: 11, name: 'QB Mango Graham Crème', image: '11.PNG', price: 38, category: 'Desserts' },
    { id: 12, name: 'Classic QB Float', image: '12.PNG', price: 29, category: 'Drinks' },
    { id: 13, name: 'Calamansi Iced Tea', image: '13.PNG', price: 25, category: 'Drinks' },
    { id: 14, name: 'Lychee Soda Fizz', image: '14.PNG', price: 30, category: 'Drinks' }
];


let listCards = [];

const body = document.querySelector("body");
const list = document.querySelector(".list");
const listCard = document.querySelector(".listCard");
const total = document.querySelector(".total");
const quantity = document.querySelector(".quantity");

document.querySelector(".shopping").addEventListener("click", () => {
    body.classList.add("active");
});

document.querySelector(".closeShopping").addEventListener("click", () => {
    body.classList.remove("active");
});

function initApp(filtered = 'All') {
    list.innerHTML = '';
    products.forEach((value, key) => {
        if (filtered === 'All' || value.category === filtered) {
            const newDiv = document.createElement("div");
            newDiv.classList.add("item");
            newDiv.innerHTML = `
                <img src="image/${value.image}">
                <div class="title">${value.name}</div>
                <div class="price">&#8369;${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${key})">Add To Cart</button>`;
            list.appendChild(newDiv);
        }
    });
}

function addToCart(key) {
    if (!listCards[key]) {
        listCards[key] = { ...products[key], quantity: 1 };
    } else {
        listCards[key].quantity++;
        listCards[key].price = listCards[key].quantity * products[key].price;
    }
    reloadCart();
}

function changeQuantity(key, qty) {
    if (qty === 0) {
        delete listCards[key];
    } else {
        listCards[key].quantity = qty;
        listCards[key].price = qty * products[key].price;
    }
    reloadCart();
}

function reloadCart() {
    listCard.innerHTML = "";
    let count = 0;
    let totalPrice = 0;

    listCards.forEach((value, key) => {
        if (value) {
            totalPrice += value.price;
            count += value.quantity;

            const newDiv = document.createElement("li");
            newDiv.innerHTML = `
          <div><img src="image/${value.image}"/></div>
          <div>${value.name}</div>
          <div>&#8369;${value.price.toLocaleString()}</div>
          <div>
            <button onclick="changeQuantity(${key}, ${value.quantity - 1})">-</button>
            <div class="count">${value.quantity}</div>
            <button onclick="changeQuantity(${key}, ${value.quantity + 1})">+</button>
          </div>`;
            listCard.appendChild(newDiv);
        }
    });

    total.innerText = totalPrice.toLocaleString();
    quantity.innerText = count;
    saveCartToFirestore();
}

async function openAddressModal() {
    const user = auth.currentUser;
    if (!user) return alert("Please log in");

    const userRef = dbfirestore.collection("users").doc(user.uid); // ✅ Compat version
    const userSnap = await userRef.get(); // ✅ works in compat


    if (!userSnap.exists) {
        return alert("User profile not found");
    }

    const data = userSnap.data();

    // Fill fields
    document.getElementById("recipient").value = `${data.firstname || ''} ${data.lastname || ''}`.trim();
    document.getElementById("contact").value = data.contactNumber || '';
    document.getElementById("street").value = data.address?.street || '';
    document.getElementById("barangay").value = data.address?.barangay || '';
    document.getElementById("city").value = data.address?.city || '';
    document.getElementById("zip").value = data.address?.zip || '';
    document.getElementById("notes").value = data.address?.notes || '';

    document.getElementById("address-modal").style.display = "flex";


    // Toggle Edit
    document.getElementById("edit-btn").addEventListener("click", () => {
        const inputs = document.querySelectorAll("#address-form input");
        inputs.forEach(input => input.removeAttribute("readonly"));
    });

    // Handle submit
    document.getElementById("address-form").addEventListener("submit", e => {
        e.preventDefault();
        const address = {
            recipient: document.getElementById("recipient").value,
            contact: document.getElementById("contact").value,
            street: document.getElementById("street").value,
            barangay: document.getElementById("barangay").value,
            city: document.getElementById("city").value,
            zip: document.getElementById("zip").value,
            notes: document.getElementById("notes").value
        };

        console.log("✅ Address ready for order:", address);
        closeAddressModal();

        // → Call your saveOrder(address) function here
        order_save(address);
    });
    // document.getElementById("place-order-btn").addEventListener("click", () => {

    // });
}


function closeAddressModal() {

    document.getElementById("address-modal").style.display = "none";
}

document.getElementById("closeAddressModal").addEventListener("click", () => { closeAddressModal() })

document.getElementById("order-now-submit").addEventListener("click", () => {
    openAddressModal()
});





async function order_save(address) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please login first");
        return;
    }

    const cartItems = listCards.filter(Boolean);
    const total = cartItems.reduce((acc, item) => acc + item.price, 0);
    const uniqueID = "QR" + Math.floor(100000 + Math.random() * 900000);

    try {
        // Fetch shortId from user profile
        const userDoc = await dbfirestore.collection("users").doc(user.uid).get();
        let shortId = "";
        if (userDoc.exists) {
            const userData = userDoc.data();
            shortId = userData.shortId || "";
            firstName = userData.firstname || "";
            lastName = userData.lastname || "";
            contact = userData.contactNumber || "";
        }

        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            shortId: shortId,
            UserFullName: `${firstName} ${lastName}`,
            orderId: uniqueID,
            items: cartItems,
            totalPrice: total,
            status: "pending",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            address: address
        };

        await dbfirestore.collection("orders").add(orderData);
        console.log("✅ Order saved");
        showMessage(`Order Successfully Placed!`, 'success');
        clearCart();
    } catch (err) {
        console.error("❌ Error placing order:", err);
        showMessage(`Error Placing Order ${err.message}`, 'error');
    }
}

function clearCart() {
    listCards = [];
    reloadCart();
}

function updateOrderStatusByEmailAndOrderId(email, orderId, newStatus) {
    dbfirestore.collection("orders")
        .where("userEmail", "==", email)
        .where("orderId", "==", orderId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log(`❌ No matching order found for ${email} with ID ${orderId}`);
                return;
            }

            snapshot.forEach(doc => {
                doc.ref.update({ status: newStatus });
                console.log(`✅ Order ${orderId} updated to "${newStatus}"`);
            });
        })
        .catch(err => {
            console.error("🔥 Error updating order:", err);
        });
    dbfirestore.collection("orders")
        .where("userEmail", "==", email)
        .where("orderId", "==", orderId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log(`❌ No matching order found for ${email} with ID ${orderId}`);
                return;
            }

            snapshot.forEach(doc => {
                doc.ref.update({ status: newStatus });
                console.log(`✅ Order ${orderId} updated to "${newStatus}"`);
            });
        })
        .catch(err => {
            console.error("🔥 Error updating order:", err);
        });
}



function saveCartToFirestore() {
    const user = auth.currentUser;
    if (!user) return;

    const cartData = listCards.filter(Boolean);
    dbfirestore.collection("carts").doc(user.uid).set({ items: cartData }, { merge: true })
        .then(() => console.log("🛒 Cart saved for", user.email))
        .catch(err => console.error("Error saving cart:", err));
}

function loadCartFromFirestore(uid) {
    dbfirestore.collection("carts").doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                listCards = doc.data().items || [];
                reloadCart();
            } else {
                console.log("🛒 No cart data found");
            }
        })
        .catch(err => console.error("Error loading cart:", err));
}

auth.onAuthStateChanged(user => {
    if (user) {
        loadCartFromFirestore(user.uid);
    }
});

function initApp(filtered = 'All') {
    list.innerHTML = '';
    products.forEach((value, key) => {
        if (filtered === 'All' || value.category === filtered) {
            const newDiv = document.createElement("div");
            newDiv.classList.add("item");
            newDiv.innerHTML = `
                <img src="image/${value.image}">
                <div class="title">${value.name}</div>
                <div class="price">&#8369;${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${key})">Add To Cart</button>`;
            list.appendChild(newDiv);
        }
    });
}

function filterCategory(category) {
    initApp(category);
}

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





window.addToCart = addToCart;
window.changeQuantity = changeQuantity;

window.reloadCart = reloadCart;
window.loadCartFromFirestore = loadCartFromFirestore;
window.listCards = listCards;
window.showMessage = showMessage;


initApp();





const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar-dashboard')
const submenu = document.getElementById('toggleSubMenu')
const submenu1 = document.getElementById('toggleSubMenu1')

// submenu.addEventListener('click', (event) => {
//     toggleSubMenu(event.currentTarget);
// });
// submenu1.addEventListener('click', (event) => {
//     toggleSubMenu(event.currentTarget);
// });


function toggleSidebar() {
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')

    closeAllSubMenus()
}

function toggleSubMenu(button) {

    if (!button.nextElementSibling.classList.contains('show')) {
        closeAllSubMenus()
    }

    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if (sidebar.classList.contains('close')) {
        sidebar.classList.toggle('close')
        toggleButton.classList.toggle('rotate')
    }
}

function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show')
        ul.previousElementSibling.classList.remove('rotate')
    })
}