const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }
    
    const exists = users.some(user => user.username === username);
    if (exists) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    users.push({ username, password });
    return res.status(200).json({
        message: "User registered successfully"
    });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {

  try {
    const getBooks = new Promise((resolve) => {
      resolve(books);
    });

    const data = await getBooks;

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author.toLowerCase();
    let result = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
            result.push(books[key]);
        }
    });
    if (result.length > 0) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title.toLowerCase();
    let result = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
            result.push(books[key]);
        }
    });
    if (result.length > 0) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
