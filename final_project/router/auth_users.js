const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

// skeletal implementations for the routes which an authorized user can access.

const regd_users = express.Router();


// array holding the users
// let users = [ ];

// for testing
let users = [{"username":"egon","password":"helloworld"}];


const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
// code to check if username and password match the one we have in records.
 // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            username: username // req.user.username should be accessible in route handler now
        }, 'access', { expiresIn: 600 * 600 });

// in production, 'access' would be some secret key, stored in environment variable, like this:
// process.env.JWT_SECRET_KEY // with .env contains JWT_SECRET_KEY

// Store access token and username in session SERVERSIDE. JWT is on CLIENT side
        req.session.authorization = {
            accessToken, username
        }
        // for debugging
        console.log(req.session.authorization) // prints {accessToken: 'dhgg', username: 'egon'}
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

/* about req.query property:
consider for example this url:
https://educative.io/user?name=Theodore&isAuthor=true

From the above code, the query strings are name and isAuthor. 
When this request is made, the req.query object becomes populated with the query strings.

req.query = {name: "Theodore", isAuthor: true}

accessing a req.query object: var queryobjectparam = req.query.<parametername>

https://www.educative.io/answers/what-is-reqquery-in-expressjs
*/

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn]

    // Log the incoming request body for debugging
    console.log("Request body:", req.body);

    if (filtered_book) {
      let review = req.body.review; // Use req.body since you're sending data with curl -d
      let reviewer = req.user.username; // Access the username from req.user

      // Check if reviewer is defined
        if (!reviewer) {
            return res.status(401).send("Reviewer username is not defined.");
        }

    if(review) {
          filtered_book['reviews'][reviewer] = review;
          books[isbn] = filtered_book;
          console.log(`Added/Updated review for book with ISBN  ${isbn} and reviewe ${reviewer}: ${review}`);
      } else {
       return res.status(400).send("Review content is required.");
        }
  }
  else{
      res.send("Unable to find this ISBN!");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  /*
    Ensure the book exists. Ensure the review exists.
    Fetch username correctly (assuming from req.user.data as in the PUT method).
    Send appropriate responses for different scenarios.
    */
    const isbn = req.params.isbn;
    const username = req.user.username;  // Assuming username directly

    console.log(`Attempting to delete review for ${username} on ISBN ${isbn}`);
    // Ensure the book exists
    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Invalid ISBN" });
    }

    console.log("Current reviews for ISBN:", book.reviews);
    // Ensure the review exists
    if (book.reviews && book.reviews[username]) {
    console.log(`Review found for ${username}, proceeding to delete.`);
    delete book.reviews[username];
    // Confirming deletion
    console.log(`Deleted review for ${username} on ISBN ${isbn}. Remaining reviews:`, book.reviews);
        return res.status(200).send("Review deleted successfully.");
    } else {
        return res.status(404).json({ message: "Review not found" });
    }

  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
