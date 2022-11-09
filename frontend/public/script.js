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
  { id, name, ingredients, price, allergens, pizzaUrl },
  allergenList
) => {
  const allergenNames = allergenList
    .filter((allergen) => allergens.includes(allergen.id))
    .map((element) => element.name)
    .join(', ');


  return `
    <div class="pizzaCard">
    <img class="pizzaImage" src=${pizzaUrl}>
      <p>${name}</p>
      <p>${ingredients}<p>
      <p>${price} HUF</p>
      <p>Allergens: ${allergenNames}</p>
      <label for="amount">Amount:</label>
      <input class="amount opacity" name="amount" id="amount-${id}" type="number" min="0">
      <button class="addToOrder buttons" id="addToOrder-${id}">Add to order</button>
    </div>
  `;
};

const orderComponent = () => {
  return `
  <div class="orderContainer">
    <label for="customerName">Name:</label>
    <input class="opacity input" id="customerName" name="customerName"></input>
    <br>
    <label for="customerEmail">Email:</label>
    <input class="opacity input" id="customerEmail" name="customerEmail"></input>
    <br>
    <label for="customerCity">City:</label>
    <input class="opacity input" id="customerCity" name="customerCity"></input>
    <br>
    <label for="customerStreet">Street:</label>
    <input class="opacity input" id="customerStreet" name="customerStreet"></input>
    <br>
    <button id="order" class="buttons">ORDER</button>
  </div>  
  `;
};

const homeComponent = () => {
  return `
  <div class="homeContainer">
  <h2 class="homeMessage">Welcome!</h2>
  <a class="homeButton" href="/pizza/list">Let's Order!</a>
  <img class="homeImage" src="/public/aurelien-lemasson-theobald-x00czbt4dfk-unsplash-3.jpg">
  </div>
  `
}

const menuComponent = () => {
  return `
  <div class="menuContainer">
  <h1>Menu</h1>
  <div class="pizzaContainer"></div>
  </div>
  `
}

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
  root.insertAdjacentHTML('afterbegin', homeComponent());
}

async function basicScript() {
  const menu = await (await fetch('/api/pizza')).json();
  const allergens = await (await fetch('/api/allergens')).json();

  const pizzas = [];

  root.insertAdjacentHTML('afterbegin', menuComponent());
  const menuContainer = document.querySelector('.menuContainer');
  const pizzaContainer = document.querySelector('.pizzaContainer');

  pizzaContainer.insertAdjacentHTML(
    'beforeend',
    menu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
  );
  menuContainer.insertAdjacentHTML('beforeend', orderComponent());
  //menuContainer.insertAdjacentHTML('beforeend', '<button id="order">ORDER</button>');

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
