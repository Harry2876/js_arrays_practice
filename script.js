'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Creating usernames for users

const createdUserNames = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createdUserNames(accounts);

//Displaying account transaction history
const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Adding feature to display the balance

const calcPrintBalance = acc => {
  acc.balance = acc.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = ` ${acc.balance} EUR `;
};

//Displaying account summary feature
const calcDisplayAccSummary = acc => {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = `${income}EUR`;

  const outcome = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  //using Math.abs to get absolute value i.e remove negative sign
  labelSumOut.textContent = `${Math.abs(outcome)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(dep => (dep * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${interest}EUR`;
};

//Adding function to update Ui
const updateUi = acc => {
  //Display Movements
  displayMovements(acc.movements);

  //Display Balance
  calcPrintBalance(acc);

  //Display Summary
  calcDisplayAccSummary(acc);
};

//Adding Countdown Timer
let timer;
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

startLogOutTimer();

//Adding login functionality
let currentAccount;

btnLogin.addEventListener('click', e => {
  //prevent from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    //Remove Credentials after login
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Update Ui
    updateUi(currentAccount);
  }
});

//Implementing Transfers
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Adding Transfer function
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    alert(` Transfer Successfull !! \n Money Sent to ${receiverAcc.owner} `);

    //Update Ui
    updateUi(currentAccount);
  }
});

//Implement Loan Feature
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(() => {
      //Add movement
      currentAccount.movements.push(amount);

      //Update Ui
      updateUi(currentAccount);

      alert(`Loan Approved to ${currentAccount.owner}`);
    }, 2500);

    inputLoanAmount.value = '';
  } else {
    inputLoanAmount.value = '';
    alert('Insufficient funds');
  }
});

//Implementing Close Account Feature
btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    //Delete Account
    accounts.splice(index, 1);

    //Hide Ui after Delete
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
