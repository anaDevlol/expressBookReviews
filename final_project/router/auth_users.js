const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};



//only registered users can login
regd_users.post("/login", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required"
    });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  const accessToken = jwt.sign(
    { data: username },
    "fingerprint_customer",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken
  };
  return res.status(200).json({
    message: "Login successful"
  });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.accessToken
    ? jwt.verify(req.session.authorization.accessToken, "fingerprint_customer").data
    : null;
  if (!username) {
    return res.status(401).json({
      message: "User not authenticated"
    });
  }
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;

  const username = req.session.authorization?.accessToken
    ? jwt.verify(req.session.authorization.accessToken, "fingerprint_customer").data
    : null;

  if (!username) {
    return res.status(401).json({
      message: "User not logged in"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "Review not found"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });

});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
