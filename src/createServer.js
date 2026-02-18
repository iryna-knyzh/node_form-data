'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('path');

function createServer() {
  const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/add-expense') {
      res.statusCode = 404;
      res.end('Not Found');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');

      const expense = JSON.parse(body);

      if (!expense.date || !expense.title || !expense.amount) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Missing required fields');

        return;
      }

      const dataPath = path.resolve(__dirname, '../db/expense.json');

      fs.writeFile(dataPath, body, (error) => {
        if (error) {
        }
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(expense));
    });
  });

  return server;
}

module.exports = {
  createServer,
};
