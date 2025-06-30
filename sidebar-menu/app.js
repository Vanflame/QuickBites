import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, get, update, remove, set, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import {
  getAuth, signOut, onAuthStateChanged, EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, orderBy, getDoc, doc, setDoc, updateDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";




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

const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')


async function renderAllOrders() {
  const currentShortId = localStorage.getItem('shortId');

  const renderedCount = {
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0
  };
  const sections = {
    pending: document.getElementById('orders-pending'),
    confirmed: document.getElementById('orders-confirmed'),
    delivered: document.getElementById('orders-delivered'),
    cancelled: document.getElementById('orders-cancelled')
  };

  // Clear all sections
  Object.entries(sections).forEach(([status, section]) => {
    const staticContent = section.querySelector('.section-header')?.outerHTML ?? '';
    section.innerHTML = staticContent;
  });


  try {
    const querySnapshot = await getDocs(collection(dbfirestore, 'orders'));
    const orders = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.shortId === currentShortId) {
        orders.push({ id: doc.id, ...data });
      }
    });


    // Sort newest to oldest
    orders.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(0);
      const bTime = b.timestamp?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    orders.forEach(order => {
      const dateObj = order.timestamp?.toDate?.();
      const date = dateObj ? dateObj.toLocaleDateString() : '—';
      const time = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

      const card = document.createElement('div');
      card.className = `order-card ${order.status || 'unknown'}`;

      let statusText = '';
      let actions = '';




      switch (order.status) {
        case 'pending':
          statusText = 'Awaiting Confirmation';
          actions = `
          <button class="action-btn summary summary-toggle">View Summary</button>
    <button class="action-btn confirm">Confirm</button>
    <button class="action-btn cancel">Cancel</button>
    `;
          break;

        case 'confirmed':
          statusText = 'Pickup Ready';
          actions = `
          <button class="action-btn summary summary-toggle">View Summary</button>
    <button class="action-btn deliver">Mark as Delivered</button>`;

          break;

        case 'delivered':
          statusText = 'Delivered';
          actions = `<button class="action-btn summary summary-toggle">View Summary</button>`;
          break;
        case 'cancelled':
          statusText = 'Cancelled';
          actions = `<button class="action-btn review">View Details</button>`;
          break;
        default:
          statusText = 'Unknown';
      }




      card.innerHTML = `
        <div class="order-header">
          <span class="order-id">#${order.orderId}</span>
          <span class="order-time">${date} • ${time}</span>
        </div>
        <div class="order-details">
          <p>Customer: ${order.UserFullName}</p>
          <p>Total: ₱${order.totalPrice}</p>
          <div class="item-list">
            <p>Items:</p>
            ${order.items.map(item => `<p>– ${item.quantity || 1}× ${item.name || 'Item'}</p>`).join('')}
          </div>
          <p>Status: ${statusText}</p>
        </div>
        <div class="order-actions">${actions}</div>
      `;

      if (order.status === 'pending') {
        const createdTime = order.timestamp?.toDate?.();
        if (createdTime) {
          const expiresAt = new Date(createdTime.getTime() + 30 * 60000); // 30 minutes from placed time

          const countdown = document.createElement('p');
          countdown.className = 'countdown-timer';

          const updateCountdown = () => {
            const now = new Date();
            const diff = expiresAt - now;

            if (diff <= 0) {
              countdown.textContent = '⏱ Expired — Cancelling...';

              // Prevent multiple triggers
              if (!countdown.hasAttribute('data-expired')) {
                countdown.setAttribute('data-expired', 'true');

                setTimeout(async () => {
                  await updateDoc(doc(dbfirestore, 'orders', order.id), { status: 'cancelled' });
                  renderAllOrders();
                }, 1500);
              }
              return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            countdown.textContent = `⏱ Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;

            setTimeout(updateCountdown, 1000); // loop each second
          };

          updateCountdown();
          card.querySelector('.order-details')?.appendChild(countdown);
        }
      }

      // Append to correct section
      const container = sections[order.status];

      if (container) container.appendChild(card);

      const summary = document.createElement('div');


      const summaryId = `summary-${order.orderId}`;
      summary.className = order.status === 'cancelled' ? 'order-details-cancelled' : 'order-summary';
      summary.id = summaryId;
      summary.style.display = 'none';



      summary.innerHTML = `
    <h3>Order ${order.status === 'cancelled' ? 'Details — Cancelled' : 'Summary'}</h3>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>${order.status === 'delivered' ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : 'Ordered'} On:</strong> ${date} • ${time}</p>
    <p><strong>Customer:</strong> ${order.UserFullName}</p>
    <hr>
    <div class="items">
      ${order.items.map(item => `<p>${item.quantity || 1}× ${item.name || 'Item'} — ₱${item.price || 0}</p>`).join('')}
    </div>
    <hr>
    <p><strong>Total:</strong> ₱${order.totalPrice}</p>
    ${order.status === 'cancelled'
          ? `<p><strong>Cancellation Reason:</strong> (e.g. Payment timeout)</p><button class="action-btn reorder">Reorder</button>`
          : `<p><strong>Paid via:</strong> GCash</p><p><strong>Delivery:</strong> Grab Express</p><button class="action-btn">Download Receipt</button>`
        }
  `;

      if (container) {
        container.appendChild(card);
        container.appendChild(summary);
        renderedCount[order.status] += 1;
      }

      Object.entries(renderedCount).forEach(([status, count]) => {
        const countEl = document.querySelector(`.order-count-${status}`);
        if (countEl) {
          if (count > 0) {
            countEl.style.display = 'block';
            countEl.textContent = `You have ${count} ${status} order${count === 1 ? '' : 's'}.`;
          } else {
            countEl.style.display = 'none';
          }
        }

        const quantityEl = document.getElementById(`quantity-${status}`);
        if (quantityEl) {
          quantityEl.style.display = count > 0 ? 'inline-block' : 'none';
          quantityEl.innerText = count > 0 ? count : '';
        }
      });




      container.appendChild(summary);

      // Toggle summary panel
      card.querySelector('.summary-toggle, .review')?.addEventListener('click', () => {
        const panel = document.getElementById(summaryId);
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      });

      // Optional: setup dynamic actions
      card.querySelector('.confirm')?.addEventListener('click', async () => {
        await updateDoc(doc(dbfirestore, 'orders', order.id), { status: 'confirmed' });
        setTimeout(renderAllOrders, 200); // wait 200ms before rerendering
      });

      card.querySelector('.cancel')?.addEventListener('click', async () => {
        await updateDoc(doc(dbfirestore, 'orders', order.id), { status: 'cancelled' });
        setTimeout(renderAllOrders, 200); // wait 200ms before rerendering
      });

      card.querySelector('.deliver')?.addEventListener('click', async () => {
        await updateDoc(doc(dbfirestore, 'orders', order.id), { status: 'delivered' });
        setTimeout(renderAllOrders, 200); // wait 200ms before rerendering
      });

      // Add reorder button event listener for cancelled orders
      card.querySelector('.reorder')?.addEventListener('click', async () => {
        try {
          // Create a new order with the same details but new orderId, timestamp, and status 'pending'
          const newOrderId = 'QB' + Math.floor(100000 + Math.random() * 900000);
          const newOrder = {
            ...order,
            orderId: newOrderId,
            status: 'pending',
            timestamp: new Date(),
          };
          delete newOrder.id; // Remove old Firestore document id to create a new document

          // Add new order to Firestore
          const ordersCollection = collection(dbfirestore, 'orders');
          await setDoc(doc(ordersCollection, newOrderId), newOrder);

          // Refresh orders list
          setTimeout(renderAllOrders, 200);
          alert('Order has been reordered successfully.');
        } catch (error) {
          console.error('Error reordering:', error);
          alert('Failed to reorder. Please try again.');
        }
      });
    });

    Object.entries(sections).forEach(([status, section]) => {
      if (renderedCount[status] === 0) {
        const message = document.createElement('p');
        message.className = 'no-orders-message';
        message.textContent = `No ${status} orders.`;
        section.appendChild(message);
      }
    });


  } catch (error) {
    console.error('❌ Error loading orders:', error);
  }
}

document.addEventListener('DOMContentLoaded', renderAllOrders);




if (toggleButton && sidebar) {
  toggleButton.addEventListener("click", () => {
    toggleSidebar();
  });
}

function toggleSidebar() {
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

document.querySelectorAll(".dropdown-btn").forEach(button => {
  button.addEventListener("click", () => {
    const subMenu = button.nextElementSibling;

    const isOpen = subMenu.classList.contains("show");
    closeAllSubMenus();

    if (!isOpen) {
      subMenu.classList.add("show");
      button.classList.add("rotate");

      if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
        toggleButton.classList.remove("rotate");
      }
    }
  });
});


window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('orders.html')) {
    const ordersButton = document.querySelector('.dropdown-btn');
    const subMenu = document.getElementById('sub-menu-orders');

    if (ordersButton && subMenu) {
      subMenu.classList.add('show');
      ordersButton.classList.add('rotate');

      if (sidebar?.classList.contains('close')) {
        sidebar.classList.remove('close');
        toggleButton?.classList.remove('rotate');
      }
    }
  }
});



function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}
function getInitials(first, last) {
  return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
}

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

function renderUserAvatar(userData) {
  const avatar = document.getElementById("profile-avatar");
  avatar.innerHTML = "";

  if (userData.photoURL) {
    const img = document.createElement("img");
    img.src = userData.photoURL;
    img.alt = "Profile";
    avatar.appendChild(img);
  } else {
    const initials = getInitials(userData.firstname, userData.lastname);
    avatar.textContent = initials;
    avatar.classList.add("initials-avatar");
  }
}



onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/login.html?section=login';
    return;
  }

  const uid = user.uid;
  const userRef = doc(dbfirestore, "users", uid);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // Ensure shortId exists
      if (!userData.shortId) {
        console.log("🕵️ User has no shortId. Creating one...");
        const shortId = await generateUniqueShortId();
        await updateDoc(userRef, { shortId });
        userData.shortId = shortId; // update local copy too
        console.log("✨ Assigned new shortId:", shortId);
      }
      if (window.location.pathname.includes("profile1.html") || window.location.pathname.includes("profile.html")) {
        // Show profile info only if elements exist
        const profileEmail = document.getElementById('profile-email');
        const qbId = document.getElementById('qb-id');
        const profileName = document.getElementById('profile-name');
        const viewContact = document.getElementById("view-contact");
        const viewAddress = document.getElementById("view-address");
        const viewBirthday = document.getElementById("view-birthday");

        if (profileEmail && qbId && profileName && viewContact && viewAddress && viewBirthday) {
          profileEmail.innerText = userData.email;
          qbId.innerText = userData.shortId;
          profileName.innerText = ` ${userData.firstname} ${userData.lastname}`;
          viewContact.innerText = userData.contactNumber;
          viewAddress.innerText = userData.address;
          viewBirthday.innerText = formatBirthday(userData.birthday);
          viewBirthday.dataset.raw = userData.birthday;
          localStorage.setItem('shortId', userData.shortId);
          renderUserAvatar(userData);
        }
      }
    } else {
      // First time user fallback
      const shortId = await generateUniqueShortId();
      const userData = {
        email: user.email,
        firstname: "",
        lastname: "",
        shortId
      };
      await setDoc(userRef, userData);

      const profileEmail = document.getElementById('profile-email');
      if (profileEmail) {
        profileEmail.innerText = userData.email;
      }
      renderUserAvatar(userData);
      console.log("📘 Created Firestore profile with shortId:", shortId);
    }

  } catch (error) {
    console.error("🔥 Error loading profile:", error);
  }

});

if (window.location.pathname.includes("profile.html")) {
  const editAccountDetailsBtn = document.getElementById('edit-account-details');
  if (editAccountDetailsBtn) {
    editAccountDetailsBtn.addEventListener("click", () => {
      switchToEdit();
    });
  }
}

function formatBirthday(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "Unknown";

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}



function switchToEdit() {
  document.getElementById("view-profile-form").style.display = "none";
  document.getElementById("edit-profile-form").style.display = "block";

  // Prefill fields using currently displayed text
  document.getElementById("edit-contact").value = document.getElementById("view-contact").innerText;
  document.getElementById("edit-address").value = document.getElementById("view-address").innerText;
  document.getElementById("edit-birthday").value = document.getElementById("view-birthday").dataset.raw || "";
}

document.getElementById('cancel-edit-account-details').addEventListener("click", () => {
  document.getElementById("edit-profile-form").style.display = "none";
  document.getElementById("view-profile-form").style.display = "block";
});


// delete function


document.addEventListener("DOMContentLoaded", () => {
  const deleteModal = document.getElementById("delete-confirmation-modal");
  const confirmBtn = document.getElementById("confirm-delete-account");
  const cancelBtn = document.getElementById("cancel-delete-confirmation");
  const triggerBtn = document.getElementById("trigger-delete-account");

  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      deleteModal.style.display = "flex";
      document.getElementById("confirm-password").value = "";
      document.getElementById("delete-error").style.display = "none";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      deleteModal.style.display = "none";
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      const password = document.getElementById("confirm-password").value;
      const errorBox = document.getElementById("delete-error");

      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        await deleteDoc(doc(dbfirestore, "users", user.uid));
        setTimeout(() => {
          showMessage("Account successfully deleted.", "error");
        }, 3000);
        window.location.href = "/login.html?section=login";
      } catch (error) {
        errorBox.innerText = "Password incorrect or request failed.";
        errorBox.style.display = "block";
        console.error("❌ Account deletion failed:", error);
      }
    });
  }
});
const currentInput = document.getElementById("current-password");
const newPassInput = document.getElementById("new-password");
const confirmInput = document.getElementById("confirm-new-password");

// password reset
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("change-password-profile");
  const closeBtn = document.getElementById("cancel-password-reset");
  const modal = document.getElementById("password-reset-modal");
  const errorBox = document.getElementById("password-reset-error");
  const form = document.getElementById("passwordResetForm");

  openBtn?.addEventListener("click", () => {
    modal.style.display = "flex";
    form.reset();
    errorBox.style.display = "none";
  });

  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();


    const current = currentInput.value.trim();
    const newPass = newPassInput.value.trim();
    const confirm = confirmInput.value.trim();


    if (!current) {
      currentInput.parentElement.classList.add('incorrect');
      showMessage('Current password is required', 'error');
      return;
    }

    if (newPass.length < 8) {
      newPassInput.parentElement.classList.add('incorrect');
      showMessage('Password must have at least 8 characters', 'error');
      return;
    }

    if (newPass !== confirm) {
      newPassInput.parentElement.classList.add('incorrect');
      confirmInput.parentElement.classList.add('incorrect');
      showMessage('New passwords do not match', 'error');
      return;
    }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      showMessage("Password updated successfully.", "success");
      modal.style.display = "none";
    } catch (err) {
      console.error("Password update error:", err);
      showMessage("Incorrect current password or error updating.", "error")
    }
  });
});


const allInputsResetPass = [currentInput, newPassInput, confirmInput].filter(input => input != null);

allInputsResetPass.forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');

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


// saving edited account details

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileEditForm");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contact = document.getElementById("edit-contact").value.trim();
    const address = document.getElementById("edit-address").value.trim();
    const birthday = document.getElementById("edit-birthday").value;

    const contactPattern = /^\\+63\\d{10}$/;

    if (!contactPattern.test(contact)) {
      showMessage("Please enter a valid number in the format +639XXXXXXXXX (10 digits after +63).", "error");
      document.getElementById("edit-contact").focus();
      return;
    }


    const user = auth.currentUser;
    if (!user) {
      showMessage("You're not logged in.", "error");
      window.location.href = '/login.html?section=login';
      return;
    }

    try {
      const userRef = doc(dbfirestore, "users", user.uid);

      await updateDoc(userRef, {
        contactNumber: contact,
        address: address,
        birthday: birthday
      });

      showMessage("Account details updated!", "success");
      document.getElementById("edit-profile-form").style.display = "none";
      document.getElementById("view-profile-form").style.display = "block";

      // Optional: update the text view immediately
      document.getElementById("view-contact").innerText = contact;
      document.getElementById("view-address").innerText = address;
      document.getElementById("view-birthday").innerText = birthday;
      document.getElementById("view-birthday").dataset.raw = birthday;

    } catch (err) {
      console.error("🔥 Error updating Firestore:", err);
      showMessage("Something went wrong while saving changes.", "error");
    }
  });
});



// hiding orders toggle 
function showOrderSection(sectionId) {
  document.querySelectorAll('.order-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');


  // Update URL param
  const url = new URL(window.location);
  url.searchParams.set('section', sectionId);
  window.history.replaceState({}, '', url);
}
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section') || 'orders-pending';
  showOrderSection(section);

  document.querySelectorAll(".order-link").forEach(link => {
    link.addEventListener("click", e => {
      // Allow navigation if you're on a different page
      if (window.location.pathname.includes("orders.html")) {
        e.preventDefault();
        const target = link.dataset.target;
        showOrderSection(target);
      }
    });
  });

};