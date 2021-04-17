// create variable to hold db connection
let db;
const request = indexedDB.open('another_budget', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database 
  const db = event.target.result;
  // create an object store (table) called `another_budget`, set it to have an auto incrementing primary key of sorts 
  db.createObjectStore('another_budget', { autoIncrement: true });
};
// upon a successful 
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    uploadBudget();
  }
};
request.onerror = function (event) {
  // log error here 
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a transactin and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['another_budget'], 'readwrite');

  // access the object store for `another_budget`
  const budgetObjectStore = transaction.objectStore('another_budget');

  // add record to your store with add method
  budgetObjectStore.add(record);
}
function uploadBudget() {
  const transaction = db.transaction(['another_budget'], 'readwrite');

  // access the object store for `another_budget`
  const budgetObjectStore = transaction.objectStore('another_budget');

  // add record to your store with add method
  const getAll = budgetObjectStore.getAll();
  //upon a successful getall
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('./api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['another_budget'], 'readwrite');
          // access the another_budget object store
          const budgetObjectStore = transaction.objectStore('another_budget');
          // clear all items in your store
          budgetObjectStore.clear();

          alert('All transactions have been saved!');
        })
        .catch(err => {
          console.log('Not working');
        });
    };
  };
};
window.addEventListener('online', uploadBudget);