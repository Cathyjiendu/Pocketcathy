/* =====================================================
   POCKETCATHY
   Personal Finance App
   ===================================================== */


/* ================= STORAGE ================= */

const USER_KEY = "pocketCathyUser";
const LOGIN_KEY = "pocketCathyLoggedIn";
const TRANSACTION_KEY = "pocketCathyTransactions";
const GOAL_KEY = "pocketCathyGoals";
const DARK_KEY = "pocketCathyDarkMode";


let transactions =
  JSON.parse(localStorage.getItem(TRANSACTION_KEY)) || [];

let goals =
  JSON.parse(localStorage.getItem(GOAL_KEY)) || [];


/* ================= ELEMENTS ================= */

const authScreen = document.getElementById("auth-screen");
const app = document.getElementById("app");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const authMessage = document.getElementById("auth-message");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");

const toast = document.getElementById("toast");


/* ================= HELPERS ================= */

function saveData() {
  localStorage.setItem(
    TRANSACTION_KEY,
    JSON.stringify(transactions)
  );

  localStorage.setItem(
    GOAL_KEY,
    JSON.stringify(goals)
  );
}


function money(amount) {
  return "₦" + Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}


/* ================= AUTH ================= */

function showLogin() {

  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  authMessage.textContent = "";
}


function showSignup() {

  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  authMessage.textContent = "";
}


loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);

document.getElementById("go-signup")
  .addEventListener("click", showSignup);

document.getElementById("go-login")
  .addEventListener("click", showLogin);


/* SIGN UP */

signupForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const name =
    document.getElementById("signup-name").value.trim();

  const email =
    document.getElementById("signup-email").value.trim().toLowerCase();

  const password =
    document.getElementById("signup-password").value;

  const confirm =
    document.getElementById("signup-confirm").value;


  if (password.length < 6) {

    authMessage.textContent =
      "Password must contain at least 6 characters.";

    authMessage.style.color = "#e05252";

    return;
  }


  if (password !== confirm) {

    authMessage.textContent =
      "Passwords do not match.";

    authMessage.style.color = "#e05252";

    return;
  }


  const existingUser = getUser();

  if (existingUser && existingUser.email === email) {

    authMessage.textContent =
      "An account with this email already exists.";

    authMessage.style.color = "#e05252";

    return;
  }


  const user = {
    name,
    email,
    password
  };


  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(LOGIN_KEY, "true");

  signupForm.reset();

  loadApp();

});


/* LOGIN */

loginForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const email =
    document.getElementById("login-email").value.trim().toLowerCase();

  const password =
    document.getElementById("login-password").value;

  const user = getUser();


  if (!user) {

    authMessage.textContent =
      "No account found. Please create an account first.";

    authMessage.style.color = "#e05252";

    return;
  }


  if (
    email !== user.email ||
    password !== user.password
  ) {

    authMessage.textContent =
      "Incorrect email or password.";

    authMessage.style.color = "#e05252";

    return;
  }


  localStorage.setItem(LOGIN_KEY, "true");

  loginForm.reset();

  loadApp();

});


/* ================= LOAD APP ================= */

function loadApp() {

  const user = getUser();

  if (!user) {
    authScreen.classList.remove("hidden");
    app.classList.add("hidden");
    return;
  }


  authScreen.classList.add("hidden");
  app.classList.remove("hidden");


  updateUserInterface();

  renderEverything();

}


/* ================= USER UI ================= */

function updateUserInterface() {

  const user = getUser();

  if (!user) return;


  const firstName =
    user.name.split(" ")[0];


  document.getElementById("welcome-name")
    .textContent = firstName;

  document.getElementById("mini-name")
    .textContent = firstName;


  const initial =
    user.name.charAt(0).toUpperCase();


  document.getElementById("mini-avatar")
    .textContent = initial;

  document.getElementById("profile-avatar")
    .textContent = initial;


  document.getElementById("profile-name")
    .value = user.name;

  document.getElementById("profile-email")
    .value = user.email;


  document.getElementById("today-date")
    .textContent =
    new Date().toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
}


/* ================= NAVIGATION ================= */

const navItems =
  document.querySelectorAll(".nav-item");

const sections =
  document.querySelectorAll(".page-section");


function showSection(sectionId) {

  sections.forEach(section => {
    section.classList.remove("active");
  });


  const target =
    document.getElementById(sectionId);

  if (target) {
    target.classList.add("active");
  }


  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.section === sectionId
    );

  });


  const titles = {
    dashboard: "Dashboard",
    transactions: "Transactions",
    income: "Income",
    expenses: "Expenses",
    savings: "Savings Goals",
    profile: "My Profile"
  };


  document.getElementById("page-title")
    .textContent =
    titles[sectionId] || "PocketCathy";
}


navItems.forEach(item => {

  item.addEventListener("click", () => {

    showSection(item.dataset.section);

  });

});


document.querySelectorAll("[data-section]")
  .forEach(button => {

    button.addEventListener("click", () => {

      showSection(button.dataset.section);

    });

  });


/* ================= TRANSACTIONS ================= */

function openTransactionModal(type = "expense") {

  modalContent.innerHTML = `

    <h2>Add ${type === "income" ? "Income" : "Expense"}</h2>

    <form id="transaction-form">

      <label>Description</label>

      <input
        id="transaction-description"
        type="text"
        placeholder="${
          type === "income"
          ? "e.g. Salary"
          : "e.g. Food"
        }"
        required
      >

      <label>Amount</label>

      <input
        id="transaction-amount"
        type="number"
        min="1"
        placeholder="0"
        required
      >

      <label>Category</label>

      <select id="transaction-category">

        ${
          type === "income"

          ? `
            <option>Salary</option>
            <option>Business</option>
            <option>Allowance</option>
            <option>Gift</option>
            <option>Other</option>
          `

          : `
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Education</option>
            <option>Entertainment</option>
            <option>Health</option>
            <option>Other</option>
          `
        }

      </select>


      <label>Date</label>

      <input
        id="transaction-date"
        type="date"
        value="${new Date().toISOString().split("T")[0]}"
        required
      >


      <button class="primary-btn">
        Add ${type === "income" ? "Income" : "Expense"}
      </button>

    </form>
  `;


  modal.classList.remove("hidden");


  document
    .getElementById("transaction-form")
    .addEventListener("submit", function(e) {

      e.preventDefault();


      const transaction = {

        id: Date.now(),

        type,

        description:
          document.getElementById(
            "transaction-description"
          ).value.trim(),

        amount:
          Number(
            document.getElementById(
              "transaction-amount"
            ).value
          ),

        category:
          document.getElementById(
            "transaction-category"
          ).value,

        date:
          document.getElementById(
            "transaction-date"
          ).value

      };


      transactions.unshift(transaction);

      saveData();

      closeModal();

      renderEverything();

      showToast(
        `${type === "income" ? "Income" : "Expense"} added successfully.`
      );

    });

}


/* ================= BUTTONS ================= */

document.getElementById("add-income-btn")
  .addEventListener("click", () =>
    openTransactionModal("income")
  );


document.getElementById("income-page-btn")
  .addEventListener("click", () =>
    openTransactionModal("income")
  );


document.getElementById("add-expense-btn")
  .addEventListener("click", () =>
    openTransactionModal("expense")
  );


document.getElementById("expense-page-btn")
  .addEventListener("click", () =>
    openTransactionModal("expense")
  );


document.getElementById("add-transaction-btn")
  .addEventListener("click", () =>
    openTransactionModal("expense")
  );


/* ================= RENDER TRANSACTIONS ================= */

function transactionHTML(transaction) {

  const income =
    transaction.type === "income";


  const icon =
    income ? "💵" : "💸";


  return `

    <div class="transaction">

      <div class="transaction-icon">
        ${icon}
      </div>

      <div class="transaction-info">

        <strong>
          ${escapeHTML(transaction.description)}
        </strong>

        <small>
          ${escapeHTML(transaction.category)}
          • ${formatDate(transaction.date)}
        </small>

      </div>

      <div class="
        transaction-amount
        ${income ? "income-amount" : "expense-amount"}
      ">

        ${income ? "+" : "-"}${money(transaction.amount)}

      </div>

    </div>
  `;
}


function renderRecentTransactions() {

  const container =
    document.getElementById("recent-transactions");


  if (transactions.length === 0) {

    container.innerHTML =
      `<div class="empty-state">
        No transactions yet.
      </div>`;

    return;
  }


  container.innerHTML =
    transactions
      .slice(0, 5)
      .map(transactionHTML)
      .join("");
}


function renderAllTransactions() {

  const container =
    document.getElementById("all-transactions");

  const search =
    document.getElementById(
      "transaction-search"
    ).value.toLowerCase();

  const filter =
    document.getElementById(
      "transaction-filter"
    ).value;


  let filtered =
    transactions.filter(transaction => {

      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(search) ||

        transaction.category
          .toLowerCase()
          .includes(search);


      const matchesFilter =
        filter === "all" ||
        transaction.type === filter;


      return matchesSearch && matchesFilter;

    });


  if (filtered.length === 0) {

    container.innerHTML =
      `<div class="empty-state">
        No transactions found.
      </div>`;

    return;
  }


  container.innerHTML =
    filtered.map(transactionHTML).join("");
}


document
  .getElementById("transaction-search")
  .addEventListener(
    "input",
    renderAllTransactions
  );


document
  .getElementById("transaction-filter")
  .addEventListener(
    "change",
    renderAllTransactions
  );


/* ================= INCOME / EXPENSE ================= */

function renderIncome() {

  const income =
    transactions.filter(t => t.type === "income");


  document.getElementById("income-list")
    .innerHTML = income.length
      ? income.map(transactionHTML).join("")
      : `<div class="empty-state">No income recorded yet.</div>`;


  const total =
    income.reduce(
      (sum, item) => sum + item.amount,
      0
    );


  document.getElementById("income-total-page")
    .textContent = money(total);
}


function renderExpenses() {

  const expenses =
    transactions.filter(t => t.type === "expense");


  document.getElementById("expense-list")
    .innerHTML = expenses.length
      ? expenses.map(transactionHTML).join("")
      : `<div class="empty-state">No expenses recorded yet.</div>`;


  const total =
    expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );


  document.getElementById("expense-total-page")
    .textContent = money(total);
}


/* ================= DASHBOARD MONEY ================= */

function renderMoney() {

  const income =
    transactions
      .filter(t => t.type === "income")
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );


  const expenses =
    transactions
      .filter(t => t.type === "expense")
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );


  const balance =
    income - expenses;


  document.getElementById("total-income")
    .textContent = money(income);

  document.getElementById("total-expenses")
    .textContent = money(expenses);

  document.getElementById("total-balance")
    .textContent = money(balance);
}


/* ================= SAVINGS GOALS ================= */

function openGoalModal() {

  modalContent.innerHTML = `

    <h2>Create Savings Goal</h2>

    <form id="goal-form">

      <label>Goal Name</label>

      <input
        id="goal-name"
        placeholder="e.g. New Phone"
        required
      >

      <label>Target Amount</label>

      <input
        id="goal-target"
        type="number"
        min="1"
        placeholder="e.g. 500000"
        required
      >

      <label>Amount Already Saved</label>

      <input
        id="goal-saved"
        type="number"
        min="0"
        value="0"
        required
      >

      <button class="primary-btn">
        Create Goal
      </button>

    </form>
  `;


  modal.classList.remove("hidden");


  document
    .getElementById("goal-form")
    .addEventListener("submit", function(e) {

      e.preventDefault();


      const goal = {

        id: Date.now(),

        name:
          document.getElementById("goal-name").value.trim(),

        target:
          Number(
            document.getElementById("goal-target").value
          ),

        saved:
          Number(
            document.getElementById("goal-saved").value
          )

      };


      goals.unshift(goal);

      saveData();

      closeModal();

      renderGoals();

      showToast("Savings goal created!");

    });

}


document.getElementById("add-savings-btn")
  .addEventListener("click", openGoalModal);


document.getElementById("goal-page-btn")
  .addEventListener("click", openGoalModal);


function goalHTML(goal) {

  const percentage =
    Math.min(
      100,
      (goal.saved / goal.target) * 100
    );


  return `

    <div class="goal-card">

      <div class="goal-header">

        <div>
          <p>Saving for</p>
          <h3>${escapeHTML(goal.name)}</h3>
        </div>

        <div class="goal-icon">
          🎯
        </div>

      </div>


      <div class="progress">

        <div
          class="progress-bar"
          style="width:${percentage}%"
        ></div>

      </div>


      <div class="goal-bottom">

        <span>
          ${money(goal.saved)}
        </span>

        <span>
          ${money(goal.target)}
        </span>

      </div>

      <p style="margin-top:10px">
        ${percentage.toFixed(0)}% completed
      </p>

    </div>

  `;
}


function renderGoals() {

  const grid =
    document.getElementById("goals-grid");

  const dashboard =
    document.getElementById("dashboard-goals");


  if (goals.length === 0) {

    grid.innerHTML =
      `<div class="empty-state">
        No savings goals yet.
      </div>`;

    dashboard.innerHTML =
      `<div class="empty-state">
        Create your first savings goal.
      </div>`;

    return;
  }


  grid.innerHTML =
    goals.map(goalHTML).join("");


  dashboard.innerHTML =
    goals
      .slice(0, 3)
      .map(goalHTML)
      .join("");
}


/* ================= PROFILE ================= */

document
  .getElementById("profile-form")
  .addEventListener("submit", function(e) {

    e.preventDefault();

    const user = getUser();

    user.name =
      document.getElementById(
        "profile-name"
      ).value.trim();


    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );


    updateUserInterface();

    showToast("Profile updated!");

  });


/* ================= MODAL ================= */

function closeModal() {

  modal.classList.add("hidden");

  modalContent.innerHTML = "";

}


document
  .getElementById("close-modal")
  .addEventListener(
    "click",
    closeModal
  );


modal.addEventListener("click", function(e) {

  if (e.target === modal) {
    closeModal();
  }

});


/* ================= DARK MODE ================= */

function loadDarkMode() {

  if (
    localStorage.getItem(DARK_KEY) === "true"
  ) {
    document.body.classList.add("dark");
  }

}


document
  .getElementById("dark-mode")
  .addEventListener("click", function() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
      DARK_KEY,
      document.body.classList.contains("dark")
    );

  });


/* ================= LOGOUT ================= */

document
  .getElementById("logout-btn")
  .addEventListener("click", function() {

    localStorage.removeItem(LOGIN_KEY);

    app.classList.add("hidden");

    authScreen.classList.remove("hidden");

    showLogin();

    showToast("You have been logged out.");

  });


/* ================= NOTIFICATIONS ================= */

document
  .getElementById("notification-btn")
  .addEventListener("click", function() {

    if (transactions.length === 0 && goals.length === 0) {

      showToast(
        "Start by adding a transaction or savings goal."
      );

      return;
    }


    showToast(
      `You have ${transactions.length} transaction(s) and ${goals.length} savings goal(s).`
    );

  });


/* ================= UTILITIES ================= */

function formatDate(date) {

  if (!date) return "";

  return new Date(date + "T00:00:00")
    .toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ================= RENDER EVERYTHING ================= */

function renderEverything() {

  renderMoney();

  renderRecentTransactions();

  renderAllTransactions();

  renderIncome();

  renderExpenses();

  renderGoals();

  updateUserInterface();

}


/* ================= START APP ================= */

loadDarkMode();


if (
  localStorage.getItem(LOGIN_KEY) === "true" &&
  getUser()
) {

  loadApp();

} else {

  authScreen.classList.remove("hidden");
  app.classList.add("hidden");

}