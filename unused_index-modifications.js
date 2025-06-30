// Modifications to index.js for highlighting IDs and adding copy buttons in modal

function showModal(title, messageHTML) {
    const modal = document.getElementById("confirmationModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.getElementById("closeModal");
    const modalCloseButton = document.getElementById("modalCloseButton");

    if (title.toLowerCase().includes("error") || title.toLowerCase().includes("alert")) {
        modalTitle.style.color = "#dc3545";
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

    const copyButtons = modalBody.querySelectorAll(".copy-button");
    copyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target-id");
            const textToCopy = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {

                alert(`Copied: ${textToCopy}`);
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
    // ... existing code ...
    // On successful order save:
    let message = `
        Order placed successfully<br>
        Order ID: <span id="order-id" class="highlight-id">${uniqueID}</span>
        <button class="copy-button" data-target-id="order-id">Copy</button><br>
        Name: ${name}<br>
        Food: ${foodName}<br>
        Quantity: ${quantity}<br>
        Total: ${totalPrice}<br>
        <div class="copy-reminder">Please copy and save your Order ID for your reference.</div>
    `;
    showModal("Order Confirmation", message);
    // ... rest of code ...
}

function book_save() {
    // ... existing code ...
    // On successful booking save:
    let message = `
        Booking created successfully<br>
        Booking ID: <span id="booking-id" class="highlight-id">${uniqueID}</span>
        <button class="copy-button" data-target-id="booking-id">Copy</button><br>
        Name: ${name}<br>
        Email: ${email}<br>
        Date Booked: ${entrydate}<br>
        Total Guests: ${guests}<br>
        <div class="copy-reminder">Please copy and save your Booking ID for your reference.</div>
    `;
    showModal("Booking Confirmation", message);
    // ... rest of code ...
}
