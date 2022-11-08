const express = require('express');
const { readFile } = require('fs/promises');
const path = require('path');
const app = express();

const frontendPath = path.join(`${__dirname}/../frontend/`);
app.use('/public', express.static(`${frontendPath}/public`));
app.use(express.json());

const orders = [
  {
    id: 1,
    pizzas: [{ id: 1, amount: 2 }],
    date: {
      year: 2022,
      month: 6,
      day: 7,
      hour: 18,
      minute: 47,
    },
    customer: {
      name: 'John Doe',
      email: 'jd@example.com',
      address: {
        city: 'Palermo',
        street: 'Via Appia 6',
      },
    },
  },
];

app.get('/', async (req, res) => {
  res.sendFile(path.join(`${frontendPath}/index.html`));
  //res.redirect('/pizza/list');
});

app.get('/api/pizza', async (req, res) => {
  const pizzas = JSON.parse(await readFile(`${__dirname}/pizza.json`));
  res.json(pizzas.pizza);
});

app.get('/api/allergens', async (req, res) => {
  const allergens = JSON.parse(await readFile(`${__dirname}/allergens.json`));
  res.json(allergens.allergens);
});

app.get('/pizza/list', (req, res) => {
  res.sendFile(path.join(`${frontendPath}/index.html`));
});

app
  .route('/api/order')
  .get((req, res) => {
    res.json(orders);
  })
  .post((req, res) => {
    orders.push({ ...req.body, id: orders.length + 1 });
    res.json(orders);
  });

app.listen(3000);
