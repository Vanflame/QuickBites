document.querySelector(".menu-toggle").addEventListener("click", function () {
    document.querySelector(".nav-menu").classList.toggle("active");
});

document.querySelectorAll(".hover").forEach(item => {
    item.addEventListener("click", function () {
        document.querySelector(".nav-menu").classList.remove("active");
    });
});


function calculateTotal() {
    let foodItem = document.getElementById("food-item");
    let selectedOption = foodItem.options[foodItem.selectedIndex];
    let price = parseInt(selectedOption.getAttribute("data-price"));
    let quantity = parseInt(document.getElementById("quantity").value);

    document.getElementById("total-price").innerText = "₱" + (price * quantity);
}

document.getElementById("order-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let foodItem = document.getElementById("food-item").value;
    let quantity = document.getElementById("quantity").value;
    let totalPrice = document.getElementById("total-price").innerText;
    let orderName = document.getElementById('orderName').value;

    //
});

document.getElementById("book-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let name = document.getElementById("booking-name").value;
    let email = document.getElementById("booking-email").value;
    let date = document.getElementById("booking-date").value;
    let guests = document.getElementById("booking-guests").value;


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


window.onload = function () {
    showSection('home');
};



