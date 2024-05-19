const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors'); // Add this line

const app = express();
const port = 3000;

// SQL Server configuration
const config = {
  user: 'sa',
  password: 'admin',
  server: 'localhost', // You may need to replace this with your SQL Server's address
  database: 'Books',
  options: {
    trustServerCertificate: true, // For Azure SQL
  },
};

// Body parser middleware
app.use(bodyParser.json());
app.use(cors()); // Add this line

// Get all books
app.get('/books', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM Books');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a single book by ID
app.get('/books/:id', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Books WHERE id = @id');
    if (result.recordset.length === 0) {
      res.status(404).send('Book not found');
    } else {
      res.json(result.recordset[0]);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create a new book
app.post('/books', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input('title', sql.NVarChar, req.body.title)
      .input('author', sql.NVarChar, req.body.author)
      .query('INSERT INTO Books (Title, Author) VALUES (@title, @author)');
    res.status(201).send('Book added successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a book by ID
app.put('/books/:id', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar, req.body.title)
      .input('author', sql.NVarChar, req.body.author)
      .query(
        'UPDATE Books SET Title = @title, Author = @author WHERE id = @id'
      );
    res.send('Book updated successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Books WHERE id = @id');
    res.send('Book deleted successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});