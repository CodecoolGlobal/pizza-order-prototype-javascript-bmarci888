const listComponent = (list) => {
  return list
    .map(
      (element) => `
  <li>${element}</li>
  `
    )
    .join('');
};

const pizzaComponent = (
  { id, name, ingredients, price, allergens },
  allergenList
) => {
  const allergenNames = allergenList
    .filter((allergen) => allergens.includes(allergen.id))
    .map((element) => element.name)
    .join(', ');

  return `
    <div>
      <p>Name: ${name}</p>
      <p>Ingredients:</p>
      <ul>${listComponent(ingredients)}</ul>
      <p>Price: ${price}</p>
      <p>Allergens: ${allergenNames}</p>
      <label for="amount">Amount:</label>
      <input name="amount" id="amount-${id}" type="number" min="0">
      <button class="addToOrder" id="addToOrder-${id}">Add to order</button>
    </div>
  `;
};

const orderComponent = () => {
  return `
  <div>
    <label for="customerName">Name:</label>
    <input id="customerName" name="customerName"></input>
    <br>
    <label for="customerEmail">Email:</label>
    <input id="customerEmail" name="customerEmail"></input>
    <br>
    <label for="customerCity">City:</label>
    <input id="customerCity" name="customerCity"></input>
    <br>
    <label for="customerStreet">Street:</label>
    <input id="customerStreet" name="customerStreet"></input>
  </div>  
  `;
};

const root = document.getElementById('root');

window.addEventListener('load', () => {
  switch (window.location.pathname) {
    case '/pizza/list':
      basicScript();
      break;

    case '/':
      home();
      break;

    default:
      break;
  }
});

function home() {
  root.insertAdjacentHTML('afterend', '<a href="/pizza/list">Welcome</a>');
}

async function basicScript() {
  const menu = await (await fetch('/api/pizza')).json();
  const allergens = await (await fetch('/api/allergens')).json();

  const pizzas = [];

  root.insertAdjacentHTML(
    'afterbegin',
    menu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
  );
  root.insertAdjacentHTML('beforeend', orderComponent());
  root.insertAdjacentHTML('beforeend', '<button id="order">ORDER</button>');

  const addToOrderBtns = Array.from(document.querySelectorAll('.addToOrder'));

  addToOrderBtns.forEach((addToOrderBtn) => {
    addToOrderBtn.addEventListener('click', (event) => {
      const id = Number(event.target.id.split('-')[1]);
      const amount = Number(document.getElementById(`amount-${id}`).value);
      pizzas.push({ id, amount });
    });
  });

  document.getElementById('order').addEventListener('click', () => {
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const city = document.getElementById('customerCity').value;
    const street = document.getElementById('customerStreet').value;

    const now = new Date();
    const [year, month, day, hour, minute] = [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
    ];

    fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        pizzas,
        date: {
          year,
          month,
          day,
          hour,
          minute,
        },
        customer: {
          name,
          email,
          address: {
            city,
            street,
          },
        },
      }),
    });
  });
}
