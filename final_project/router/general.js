const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

//  skeletal implementations for the routes which a general user can access.


const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});


/* 
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // done
  res.send(JSON.stringify(books,null,4));
});

*/


// Get the book list available in the shop ASYNCHRONOUS
public_users.get('/', function (req, res) {
    // Assume fetchData() returns a Promise
    fetchData()
        .then(data => {
            // Send the data as a response
          console.log("it worked");
            res.status(200).json(data);
        })
        .catch(error => {
            // Handle any errors
            res.status(500).json({ error: error.message });
        });
});

// function returning a Promise
function fetchData() {
    return new Promise((resolve, reject) => {
      // checks for some errors
         if (!books) {
            // If 'books' is undefined or not accessible
            reject(new Error('Books data is not available.'));
        } else if (Array.isArray(books) && books.length === 0) {
            // If 'books' is an empty array
            reject(new Error('Books list is empty.'));
        } else {
            // Successfully retrieved data
            resolve(books);
        }
    });
}


/*
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the isbn parameter from the request URL 
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
 */



// Get the book details based on isbn ASYNCHRONOUS
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Assume fetchData() returns a Promise
    fetchIsbn(isbn)
        .then(data => {
            // Send the data as a response
          console.log("isbn worked");
            res.status(200).json(data);
        })
        .catch(error => {
            // Handle any errors
            res.status(500).json({ error: error.message });
        });
});

// function returning a Promise
function fetchIsbn(isbn) {
    return new Promise((resolve, reject) => {
      // checks for some errors
         if (!books[isbn]) {
            // If 'books' is undefined or not accessible
            reject(new Error('Books with this isbn is not available.'));
        } else if (Array.isArray(books) && books.length === 0) {
            // If 'books' is an empty array
            reject(new Error('Books list is empty.'));
        } else {
            // Successfully retrieved data
            resolve(books[isbn]);
        }
    });
}



// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let booksbyauthor = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if(books[isbn]["author"] === req.params.author) {
      booksbyauthor.push({"isbn":isbn,
                          "title":books[isbn]["title"],
                          "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbyauthor}, null, 4));
});


/*
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let booksbytitle = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if(books[isbn]["title"] === req.params.title) {
      booksbytitle.push({"isbn":isbn,
                          "title":books[isbn]["title"],
                          "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbytitle}, null, 4));
});
*/

// Get the book details based on title ASYNCHRONOUS
public_users.get('/title/:title', function (req, res) { // Define req and res here
    const title = req.params.title; // Get the title from request parameters

    fetchTitle(title) // Call the fetchTitle function with the title
        .then(data => {
            console.log("title worked");
            res.status(200).json(data); // Send the data as a response
        })
        .catch(error => {
            // Handle any errors
            res.status(500).json({ error: error.message });
        });
});

// Function returning a Promise
function fetchTitle(title) {
    return new Promise((resolve, reject) => {
        if (!books) {
            reject(new Error('Books with this title are not available.'));
        } else if (Array.isArray(books) && books.length === 0) {
            reject(new Error('Books list is empty.'));
        } else {
            let booksbytitle = [];
            let isbns = Object.keys(books);

            isbns.forEach((isbn) => {
                if (books[isbn]["title"].toLowerCase() === title.toLowerCase()) {
                    booksbytitle.push({
                        "isbn": isbn,
                        "title": books[isbn]["title"],
                        "reviews": books[isbn]["reviews"]
                    });
                }
            });

            if (booksbytitle.length > 0) {
                resolve({ booksbytitle });
            } else {
                reject(new Error('No books found with this title.'));
            }
        }
    });
}


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbnParam = req.params.isbn;

  // get book review based on isbn of request parameters
  const reviews = books[isbnParam]["reviews"]
  if(!reviews){
    rest.status(404).json({message: 'no reviews found for this book'});
  } else {
    res.status(200).json(reviews);
  }
});

module.exports.general = public_users;
