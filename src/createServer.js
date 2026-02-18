'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const querystring = require('node:querystring');

function createServer() {
  return http.createServer((req, res) => {
    /* ---------- GET: HTML form ---------- */
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <h1>Add expense</h1>
        <form method="POST" action="/add-expense">
          <label>Date: <input name="date" type="date" required /></label><br />
          <label>Title: <input name="title" type="text" required /></label><br />
          <label>Amount: <input name="amount" type="number" required /></label><br />
          <button type="submit">Save</button>
        </form>
      `);

      return;
    }

    if (req.method !== 'POST' || req.url !== '/add-expense') {
      res.statusCode = 404;
      res.end('Not Found');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      const dataPath = path.resolve(__dirname, '../db/expense.json');

      let expense;

      try {
        if (req.headers['content-type']?.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = querystring.parse(body);
        }
      } catch {
        res.statusCode = 400;
        res.end('Invalid data');

        return;
      }

      // validation
      if (!expense.date || !expense.title || !expense.amount) {
        res.statusCode = 400;
        res.end('Missing required fields');

        return;
      }

      fs.writeFile(dataPath, JSON.stringify(expense), (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Server error');

          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(expense));
      });
    });
  });
}

module.exports = { createServer };
