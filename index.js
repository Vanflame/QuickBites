import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, get, update, remove, set, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


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

//hide the booking or data order
document.getElementById("idtrack").addEventListener("input", function () {
    let idtrackData = this.value.trim().toLowerCase(); // Get user input
    let bookingData = document.querySelector(".booking_data");
    let orderData = document.querySelector(".order_data");
    let buttonsBook = document.querySelector(".buttonEdits");
    let buttonsorder = document.querySelector(".buttonEdits-order");
    let searchbook = document.querySelector(".trackbutton_book");
    let searchorder = document.querySelector(".trackbutton_order");



    if (idtrackData.startsWith("qb")) {
        // Hide booking_data, show order_data
        bookingData.style.display = "block";
        orderData.style.display = "none";
        buttonsBook.style.display = "block";
        searchbook.style.display = "block";
        buttonsorder.style.display = "none";
    } else {
        // Show booking_data, hide order_data
        bookingData.style.display = "none";
        orderData.style.display = "block";
        buttonsBook.style.display = "none";
        searchbook.style.display = "none";
        buttonsorder.style.display = "block";


    }

    if (idtrackData.startsWith("qr")) {
        // Hide booking_data, show order_data
        bookingData.style.display = "none";
        orderData.style.display = "block";
        buttonsBook.style.display = "none";
        searchorder.style.display = "block";
        buttonsorder.style.display = "block";
    } else {
        // Show booking_data, hide order_data
        bookingData.style.display = "block";
        orderData.style.display = "none";
        buttonsBook.style.display = "block";
        searchorder.style.display = "none";
        buttonsorder.style.display = "none";

    }
});


// Button Event Listeners for book
document.getElementById("book-now-submit").addEventListener("click", book_save);
document.getElementById("track-button").addEventListener("click", () => {
    let uniqueID = document.getElementById("idtrack").value;
    track_booking(uniqueID);
});
document.getElementById("save-button").addEventListener("click", () => {
    let name = document.getElementById("track-booking-name").innerHTML;
    let email = document.getElementById("track-booking-email").innerHTML;
    let date = document.getElementById("track-booking-date-booked").innerHTML;
    let guests = document.getElementById("track-booking-guest").innerHTML;
    let uniqueID = document.getElementById("idtrack").value;
    let now = new Date();

    //formatting time
    let formattedTime = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0') + ":" +
        now.getSeconds().toString().padStart(2, '0');

    // formatting date
    let formattedDate = (now.getMonth() + 1).toString().padStart(2, '0') + "/" +
        now.getDate().toString().padStart(2, '0') + "/" +
        now.getFullYear();

    update_booking(uniqueID, {


        TimestampNumeric: now, // ✅ Store timestamp in milliseconds
        DatestampChange: formattedDate,
        TimestampChange: formattedTime,
        Type: "Edited Booking",
        Name: name,
        Email: email,
        Date: date,
        Guests: guests
    }).then(() => {
        track_booking(uniqueID);
    }).catch(error => {
        console.error("Error updating booking:", error);
    });
});

document.getElementById("delete-button").addEventListener("click", () => {
    let uniqueID = document.getElementById("idtrack").value;
    delete_booking(uniqueID);
});

//Button Event Listeners for order
document.getElementById("order-now-submit").addEventListener("click", order_save);
document.getElementById("track-button-order").addEventListener("click", () => {
    let uniqueID = document.getElementById("idtrack").value;
    track_order(uniqueID);
});
// document.getElementById("save-button-order").addEventListener("click", () => {
//     let name = document.getElementById("track-order-name").innerHTML;
//     let newQuantity = document.getElementById("track-order-quantity").innerHTML;
//     let uniqueID = document.getElementById("idtrack").value;
//     let now = Date.now();

//     update_order(uniqueID, {
//         TimestampNumeric: now,
//         DatestampChange: new Date(now).toLocaleDateString("en-US"),
//         TimestampChange: new Date(now).toLocaleTimeString("en-US", { hour12: false }),
//         Type: "Edited Orders",
//         Name: name,
//         FoodName: foodName,
//         Price: newfoodPrice, 
//         Quantity: newQuantity,
//         Total: totalPrice
//     }).then(() => {
//         track_order(uniqueID);
//     }).catch(error => {
//         console.error("Error updating booking:", error);
//     });
// });

document.getElementById("delete-button-order").addEventListener("click", () => {
    let uniqueID = document.getElementById("idtrack").value;
    console.log("button delete clicked");
    delete_order(uniqueID);
});

function showModal(title, messageHTML) {
    const modal = document.getElementById("confirmationModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.getElementById("closeModal");
    const modalCloseButton = document.getElementById("modalCloseButton");

    // Style modal for alert type messages
    if (title.toLowerCase().includes("error") || title.toLowerCase().includes("alert")) {
        modalTitle.style.color = "#dc3545"; // Bootstrap danger red
        modalBody.style.color = "#721c24";
        modal.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
    } else {
        modalTitle.style.color = "";
        modalBody.style.color = "";
        modal.style.backgroundColor = "rgba(0,0,0,0.4)";
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = messageHTML;
    modal.style.display = "block";

    // Add event listeners for copy buttons inside modalBody
    const copyButtons = modalBody.querySelectorAll(".copy-button");
    copyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target-id");
            const textToCopy = document.getElementById(targetId).textContent;
            const copied = document.getElementById("copied");
            navigator.clipboard.writeText(textToCopy).then(() => {
                copied.innerHTML = "Copied!"
            }).catch(err => {
                alert("Failed to copy text: " + err);
            });
        });
    });

    function closeHandler() {
        modal.style.display = "none";
        closeModal.removeEventListener("click", closeHandler);
        modalCloseButton.removeEventListener("click", closeHandler);
        window.removeEventListener("click", outsideClickHandler);
    }

    function outsideClickHandler(event) {
        if (event.target === modal) {
            closeHandler();
        }
    }

    closeModal.addEventListener("click", closeHandler);
    modalCloseButton.addEventListener("click", closeHandler);
    window.addEventListener("click", outsideClickHandler);
}

function order_save() {
    console.log("order called");
    var item = document.getElementById('food-item');
    let selectedOption = item.options[item.selectedIndex];
    let foodName = selectedOption.value;
    let foodPrice = selectedOption.getAttribute("data-price");
    var quantity = document.getElementById('quantity').value;
    var name = document.getElementById('orderName').value.trim();
    let now = Date.now();

    if (!name.match(/^[A-Za-z0-9\s]+$/)) {
        showModal("Error", "Invalid name! No special characters.");
        return;
    }

    let formattedTime = new Date(now).toLocaleTimeString("en-US", { hour12: false });
    let formattedDate = new Date(now).toLocaleDateString("en-US");

    let totalPrice = foodPrice * quantity;
    let uniqueID = "QR" + Math.floor(100000 + Math.random() * 900000);

    const qrContent = uniqueID;
    const qrContainer = document.createElement("div");
    new QRCode(qrContainer, {
        text: qrContent,
        width: 200,
        height: 200
    });

    const ordersRef = ref(db, 'Orders/');

    get(ordersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let orders = snapshot.val();
            let orderKey = Object.keys(orders).find(key => orders[key].Name === name);

            if (orderKey) {
                let lastOrderTimestamp = orders[orderKey].TimestampNumeric || 0;

                let timeDifference = (now - lastOrderTimestamp) / 1000; // Convert to seconds

                if (timeDifference < 30) { // Prevent orders within 5 seconds
                    showModal("Error", `You can only place an order every 5 seconds!<br>Wait ${(5 - timeDifference).toFixed(1)} seconds.`);
                    return;
                }
            }
        }

        // ✅ Proceed with placing a new order
        let orderRef = ref(db, 'Orders/' + (name + uniqueID));

        let orderData = {
            DateandTimestamp: formattedDate + formattedTime,
            OrderID: uniqueID,
            TimestampNumeric: now,
            Datestamp: formattedDate,
            Timestamp: formattedTime,
            Type: "Order",
            Name: name,
            FoodName: foodName,
            Price: foodPrice,
            Quantity: quantity,
            Total: totalPrice,
            DatestampChange: formattedDate,
            TimestampChange: formattedTime
        };

        set(orderRef, orderData)
            .then(() => {
                let message = `
                    Order placed successfully<br>
                    Order ID: <span id="order-id" class="highlight-id">${uniqueID}</span>
                    <button class="copy-button" data-target-id="order-id" id="copied">Copy</button><br>
                    ${qrContainer.outerHTML}
                    Name: ${name}<br>
                    Food: ${foodName}<br>
                    Quantity: ${quantity}<br>
                    Total: ${totalPrice}<br>
                    <div class="copy-reminder">Please copy and save your Order ID or your QRcode for your reference.</div>
                `;
                console.log(message);
                showModal("Order Confirmation", message);
            })
            .catch(error => {
                console.error("Error saving order in Firebase:", error);
                showModal("Error", "Error saving order in Firebase: " + error.message);
            });
    }).catch(error => {
        console.error("Error checking previous order:", error);
        showModal("Error", "Error checking previous order: " + error.message);
    });
}

// 🔍 Retrieve Order Data
function track_order(uniqueID) {
    const ordersRef = ref(db, 'Orders/');

    get(ordersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let orders = snapshot.val();
            let orderKey = Object.keys(orders).find(key => orders[key].OrderID === uniqueID);

            if (orderKey) {
                let orderData = orders[orderKey];

                console.log(`Order Found!\nOrder ID: ${orderData.OrderID}\nName: ${orderData.Name}\nItem: ${orderData.FoodName}\nPrice: ${orderData.Price}\nQuantity:${orderData.Quantity}\nTotal:${orderData.Total}`);

                // 🔹 **Update InnerHTML**
                document.getElementById("track-order-date").innerHTML = orderData.Datestamp;
                document.getElementById("track-order-time").innerHTML = orderData.Timestamp;
                document.getElementById("track-order-orderid").innerHTML = orderData.OrderID;
                document.getElementById("track-order-name").innerHTML = orderData.Name;
                document.getElementById("track-order-item").innerHTML = orderData.FoodName;
                document.getElementById("track-order-price").innerHTML = orderData.Price;
                document.getElementById("track-order-quantity").innerHTML = orderData.Quantity;
                document.getElementById("track-order-total").innerHTML = orderData.Total;
                document.getElementById("track-order-type").innerHTML = orderData.Type;
                document.getElementById("track-order-last-save-date").innerHTML = orderData.DatestampChange;
                document.getElementById("track-order-last-save-time").innerHTML = orderData.TimestampChange;

            } else {
                console.log(`Error: No existing order found for "${uniqueID}".`);
                showModal("Error", `Error: No existing order found for "${uniqueID}".`);
            }
        } else {
            console.log("Error: No orders found in the database.");
            showModal("Error", "Error: No orders found in the database.");
        }
    }).catch(error => console.log("Error retrieving orders: " + error.message));
}


// ✏️ Update Order Data
function update_order(uniqueID, updatedData) {
    const ordersRef = ref(db, 'Orders/');

    get(ordersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let orders = snapshot.val();
            let orderKey = Object.keys(orders).find(key => orders[key].OrderID === uniqueID);

            if (orderKey) {
                const orderRef = ref(db, `Orders/${orderKey}`);

                update(orderRef, updatedData)
                    .then(() => {
                        console.log("Order updated successfully");
                        showModal("Order Updated!", `Order updated successfully!\nOrder ID: ${orderKey}\nName: ${updatedData.Name}\nFood: ${updatedData.FoodName}\nQuantity: ${updatedData.Quantity}\nTotal: ${updatedData.Total}`);
                    })
                    .catch(error => {
                        console.log("Error updating order: " + error.message);
                        showModal("Error", "Error updating order: " + error.message);
                    });
            } else {
                console.log(`Error: No existing order found for\nOrder ID: ${orders[orderKey].OrderID}\nName: ${orders[orderKey].Name}`);
                showModal("Error", `Error: No existing order found for\nOrder ID: ${orders[orderKey].OrderID}\nName: ${orders[orderKey].Name}`);
            }
        } else {
            console.log("Error: No orders found in the database.")
            showModal("Error", "Error: No orders found in the database.");
        }
    }).catch(error => console.log("Error retrieving orders: " + error.message));
}

// �️ Delete Order Data
function delete_order(uniqueID) {
    const ordersRef = ref(db, 'Orders/');

    get(ordersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let orders = snapshot.val();
            let orderKey = Object.keys(orders).find(key => orders[key].OrderID === uniqueID);
            let deleteorder = `
              Order deleted successfully<br>
              Order ID: ${orders[orderKey].OrderID}</span><br>
              Name: ${orders[orderKey].Name}<br>

    `;

            if (orderKey) {
                remove(ref(db, `Orders/${orderKey}`))
                    .then(() => {
                        console.log(`Order deleted successfully!\nOrder ID: ${orders[orderKey].OrderID}\nName: ${orders[orderKey].Name}`);
                        showModal("Order Deleted!", deleteorder);
                    })
                    .catch(error => {
                        console.log("Error deleting order: " + error.message);
                        showModal("Error", "Error deleting order: " + error.message);
                    });
            } else {
                console.log(`Error: No existing order found for "${uniqueID}".`);
                showModal("Error", `Error: No existing order found for "${uniqueID}".`);
            }
        } else {
            console.log("Error: No orders found in the database.");
            showModal("Error", "Error: No orders found in the database.");
        }
    }).catch(error => console.log("Error retrieving orders: " + error.message));
}

function book_save() {
    console.log("booking called");
    let name = document.getElementById("booking-name").value.trim();
    let email = document.getElementById("booking-email").value.trim();
    let date = document.getElementById("booking-date").value.trim();
    let guests = document.getElementById("booking-guests").value.trim();

    //formatting date entry from elementid ('date')
    let dateParts = date.split("-");
    let entrydate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

    // Validation
    if (!name.match(/^[A-Za-z0-9\s]+$/)) {
        showModal("Error", "Invalid name! No special characters.");
        return;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) {
        showModal("Error", "Invalid email format! Please enter a valid email address.");
        return;
    }
    if (!entrydate.match(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)) {
        showModal("Error", "Invalid date format! Please enter as MM/DD/YYYY (e.g., 05/22/2025).");
        return;
    }
    if (!guests.match(/^\d+$/) || parseInt(guests) < 1) {
        showModal("Error", "Invalid guest count! Only positive numbers are allowed.");
        return;
    }

    let now = new Date();
    let uniqueID = "QB" + Math.floor(100000 + Math.random() * 900000);

    //formatting time
    let formattedTime = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0') + ":" +
        now.getSeconds().toString().padStart(2, '0');

    //Qr generater//
    const qrContent = uniqueID;
    const qrContainer = document.createElement("div");
    new QRCode(qrContainer, {
        text: qrContent,
        width: 200,
        height: 200
    });


    // formatting date
    let formattedDate = (now.getMonth() + 1).toString().padStart(2, '0') + "/" +
        now.getDate().toString().padStart(2, '0') + "/" +
        now.getFullYear();
    const bookingRef = ref(db, 'Booking/' + (name + uniqueID));
    let bookingData = {
        DateandTimestamp: formattedDate + formattedTime,
        BookingID: uniqueID,
        Datestamp: formattedDate,
        Timestamp: formattedTime,
        Type: "Booking",
        Name: name,
        Email: email,
        Date: entrydate,
        Guests: guests,
        DatestampChange: formattedDate,
        TimestampChange: formattedTime
    };

    set(bookingRef, bookingData)
        .then(() => {
            let message = `
                Booking created successfully<br>
                Booking ID: <span id="booking-id" class="highlight-id">${uniqueID}</span>
                <button class="copy-button" data-target-id="booking-id" id="copied">Copy</button><br>
                ${qrContainer.outerHTML}
                Name: ${name}<br>
                Email: ${email}<br>
                Date Booked: ${entrydate}<br>
                Total Guests: ${guests}<br>
                <div class="copy-reminder">Please copy and save your Booking ID for your reference.</div>
            `;
            console.log(message);
            showModal("Booking Confirmation", message);
            track_booking(uniqueID);
        })
        .catch(error => {
            console.error("Error saving booking in Firebase:", error);
            showModal("Error", "Error saving booking in Firebase: " + error.message);
        });

}

function track_booking(uniqueID) {
    const bookingRef = ref(db, "Booking/");


    get(bookingRef).then((snapshot) => {
        if (snapshot.exists()) {
            let booking = snapshot.val();
            let bookingKey = Object.keys(booking).find(key => booking[key].BookingID === uniqueID);


            if (bookingKey) {
                let bookingData = booking[bookingKey];

                console.log(`Booking Found!\nBooking ID: ${bookingData.BookingID}\nName: ${bookingData.Name}\nEmail: ${bookingData.Email}\nDate Booked: ${bookingData.Date}\nTotal Guest:${bookingData.Guests}`);

                // 🔹 **Update InnerHTML**
                document.getElementById("track-booking-date").innerHTML = bookingData.Datestamp;
                document.getElementById("track-booking-time").innerHTML = bookingData.Timestamp;
                document.getElementById("track-booking-bookingid").innerHTML = bookingData.BookingID;
                document.getElementById("track-booking-name").innerHTML = bookingData.Name;
                document.getElementById("track-booking-email").innerHTML = bookingData.Email;
                document.getElementById("track-booking-date-booked").innerHTML = bookingData.Date;
                document.getElementById("track-booking-guest").innerHTML = bookingData.Guests;
                document.getElementById("track-booking-type").innerHTML = bookingData.Type;
                document.getElementById("track-booking-last-save-date").innerHTML = bookingData.DatestampChange;
                document.getElementById("track-booking-last-save-time").innerHTML = bookingData.TimestampChange;

            } else {
                console.log(`Error: No existing booking found for "${uniqueID}".`);
                showModal("Error", `Error: No existing booking found for "${uniqueID}".`);
            }
        } else {
            console.log("Error: No booking found in the database.");
            showModal("Error", "Error: No booking found in the database.");
        }
    }).catch(error => console.log("Error retrieving bookings: " + error.message));
}



function update_booking(uniqueID, updatedData) {
    const bookingRef = ref(db, 'Booking/');

    return get(bookingRef).then((snapshot) => {
        if (snapshot.exists()) {
            let booking = snapshot.val();
            let bookingKey = Object.keys(booking).find(key => booking[key].BookingID === uniqueID);

            if (bookingKey) {
                const bookingRef = ref(db, `Booking/${bookingKey}`);

                return update(bookingRef, updatedData)


                    .then(() => {
                        let updatenotif = `
                        Booking updated successfully<br>
                        Booking ID: <span id="booking-id" class="highlight-id">${uniqueID}</span>
                        <button class="copy-button" data-target-id="booking-id" id="copied">Copy</button><br>
                        Name: ${updatedData.Name}<br>
                        Email: ${updatedData.Email}<br>
                        Date Booked: ${updatedData.Date}<br>
                        Total Guests: ${updatedData.Guests}<br>
                        <div class="copy-reminder">Please copy and save your Booking ID for your reference.</div>
                    `;

                        console.log("Booking updated successfully");
                        showModal("Booking Updated!", updatenotif);
                    })
                    .catch(error => {
                        console.log("Error updating booking: " + error.message);
                        showModal("Error", "Error updating booking: " + error.message);
                        throw error;
                    });
            } else {
                console.log(`Error: No existing booking found for "${uniqueID}".`);
                alert(`Error: No existing booking found for "${uniqueID}".`);
                return Promise.reject(new Error("Booking not found"));
            }
        } else {
            console.log("Error: No booking found in the database.")
            alert("Error: No booking found in the database.");
            return Promise.reject(new Error("No bookings in database"));
        }
    }).catch(error => {
        console.log("Error retrieving bookings: " + error.message);
        throw error;
    });
}

function delete_booking(uniqueID) {

    const bookingRef = ref(db, 'Booking/');

    get(bookingRef).then((snapshot) => {


        if (snapshot.exists()) {
            let booking = snapshot.val();
            let bookingKey = Object.keys(booking).find(key => booking[key].BookingID === uniqueID);

            let deletebooking = `
              Booking deleted successfully<br>
              Booking ID: ${booking[bookingKey].BookingID}</span><br>
              Name: ${booking[bookingKey].Name}<br>
    `;

            if (bookingKey) {
                remove(ref(db, `Booking/${bookingKey}`))
                    .then(() => {
                        console.log(`Booking deleted successfully!\nBooking ID: ${booking[bookingKey].BookingID}\nName: ${booking[bookingKey].Name}`)
                        showModal("Booking Deleted!", deletebooking);
                    })
                    .catch(error => {
                        console.log("Error deleting booking: " + error.message);
                        showModal("Error", "Error deleting booking: " + error.message);
                    });
            } else {
                console.log(`Error: No existing booking found for "${uniqueID}".`);
                showModal("Error", `Error: No existing booking found for "${uniqueID}".`);
            }
        } else {
            console.log("Error: No booking found in the database.");
            showModal("Error", "Error: No booking found in the database.");
        }
    }).catch(error => console.log("Error retrieving bookings: " + error.message));

}


document.getElementById("edit-button").addEventListener("click", function () {
    let idtrackData = document.getElementById("idtrack").value.trim();
    let editableElements = ["track-booking-date-booked", "track-booking-name", "track-booking-email", "track-booking-guest"];
    if (!idtrackData) { // Check if there's data inside idtrack
        showModal("Error", "Error: You need to enter orderID or bookingID before editing.");
        return;
    }
    editableElements.forEach(id => {
        document.getElementById(id).setAttribute("contenteditable", "true");
        document.getElementById(id).style.border = "1px solid #ccc"; // Visual indicator
    });

    this.style.display = "none"; // Hide Edit button
    document.getElementById("save-button").style.display = "inline-block"; // Show Save button
});

document.getElementById("save-button").addEventListener("click", function () {
    let name = document.getElementById("track-booking-name").innerText.trim();
    let email = document.getElementById("track-booking-email").innerText.trim();
    let dateBooked = document.getElementById("track-booking-date-booked").innerText.trim();
    let totalGuest = document.getElementById("track-booking-guest").innerText.trim();
    let uniqueID = document.getElementById("idtrack").value;
    track_booking(uniqueID);

    // 🔹 **Validation before saving**
    if (!name.match(/^[A-Za-z0-9\s]+$/)) {
        showModal("Invalid name! Only letters and spaces are allowed.");
        return;
    }

    if (!email.match(/^\S+@\S+\.\S+$/)) {
        showModal("Error", "Invalid name! Only letters, numbers, and spaces are allowed.");
        return;
    }

    if (!dateBooked.match(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)) {
        showModal("Invalid date format! Please enter as MM/DD/YYYY (e.g., 05/22/2025).");
        return;
    }

    if (!totalGuest.match(/^\d+$/) || parseInt(totalGuest) < 1) {
        showModal("Invalid guest count! Only positive numbers are allowed.");
        return;
    }

    let editableElements = ["track-booking-date-booked", "track-booking-name", "track-booking-email", "track-booking-guest"];

    editableElements.forEach(id => {
        document.getElementById(id).setAttribute("contenteditable", "false");
        document.getElementById(id).style.border = "none";
    });


    this.style.display = "none"; // Hide Save button
    document.getElementById("edit-button").style.display = "inline-block"; // Show Edit button
});






