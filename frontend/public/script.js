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
      <p>${ingredients.join(', ')}<p>
      <p>${price} HUF</p>
      <p>Allergens: ${allergenNames}</p>
      <label for="amount">Amount:</label>
      <input class="amount opacity" name="amount" id="amount-${id}" type="number" min="1" value='1' required>
      <button class="addToOrder buttons" id="addToOrder-${id}">Add to order</button>
    </div>
  `;
};

const orderComponent = () => {
  return `
  <div class="orderContainer">
  <p>There's no pizza in your cart, please put at least one in it.</p>
  <p class"hide" id="orders"></p>
    <form id="customerForm" class="hide">
    <label for="customerName">Name:</label>
    <input class="opacity input" id="customerName" name="customerName" minlength="3" required type="text"></input>
    <br>
    <label for="customerEmail">Email:</label>
    <input class="opacity input" id="customerEmail" name="customerEmail" type="email" required></input>
    <br>
    <label for="customerCity">City:</label>
    <input class="opacity input" id="customerCity" name="customerCity" minlength="3" required type="text"></input>
    <br>
    <label for="customerStreet">Street:</label>
    <input class="opacity input" id="customerStreet" name="customerStreet" minlength="3" required type="text"></input>
    <br>
    <input type="submit" id="order" class="buttons" value="ORDER"></input>
    </form>
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
  `;
};

const menuComponent = (allergens) => {
  return `
  <div class="cartContainer">
  <img id="cartImg" src="/public/cart.svg" alt="cart">
  <div id="cartCounter">0</div>
  </div>
  <div class="menuContainer">
  <h1>Menu</h1>
  <div class="filterContainer">
  ${allergens.map((allergen) => filterComponent(allergen)).join('')}
  </div>
  <div class="pizzaContainer"></div>
  </div>
  `;
};

const filterComponent = (allergen) => {
  return `
  <button class="buttons" id="allergen-${allergen.id}">${allergen.name}</button>
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
  root.insertAdjacentHTML('afterbegin', homeComponent());
}

async function basicScript() {
  const menu = await (await fetch('/api/pizza')).json();
  const allergens = await (await fetch('/api/allergens')).json();

  const pizzas = [];
  const chosenAllergens = [];

  const cartComponent = (pizzas) =>
    pizzas.map(
      (element) => `
  <p>${element.amount}  ${menu[element.id - 1].name}   <button id="${
        element.id
      }" class="removeButton buttons">Remove</button></p>
  `
    );

  root.insertAdjacentHTML('afterbegin', menuComponent(allergens));
  const menuContainer = document.querySelector('.menuContainer');
  const pizzaContainer = document.querySelector('.pizzaContainer');
  const filterContainer = document.querySelector('.filterContainer');
  const cartContainer = document.querySelector('.cartContainer');

  filterContainer.addEventListener('click', (event) => {
    if (!event.target.id) return;
    const id = Number(event.target.id.split('-')[1]);
    const filterBtn = document.getElementById(`allergen-${id}`).classList;
    filterBtn.contains('filterBtnActive')
      ? filterBtn.remove('filterBtnActive')
      : filterBtn.add('filterBtnActive');
    const indexOfchosenAllergens = chosenAllergens.findIndex(
      (element) => element === id
    );
    indexOfchosenAllergens === -1
      ? chosenAllergens.push(id)
      : chosenAllergens.splice(indexOfchosenAllergens, 1);

    console.log(chosenAllergens);

    const filteredMenu = menu.filter(
      (pizza) =>
        !pizza.allergens.some((allergen) => chosenAllergens.includes(allergen))
    );

    while (pizzaContainer.firstChild) {
      pizzaContainer.removeChild(pizzaContainer.firstChild);
    }

    pizzaContainer.insertAdjacentHTML(
      'beforeend',
      filteredMenu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
    );

    const addToOrderBtns = Array.from(document.querySelectorAll('.addToOrder'));

    addToOrderBtns.forEach((addToOrderBtn) => {
      addToOrderBtn.addEventListener('click', (event) => {
        const id = Number(event.target.id.split('-')[1]);
        const amount = Number(document.getElementById(`amount-${id}`).value);
        if (amount < 1) return;
        const index = pizzas.findIndex((pizza) => pizza.id === id);
        if (index !== -1) {
          pizzas[index].amount += amount;
        } else {
          pizzas.push({ id, amount });
        }
        const cartCounter = document.getElementById('cartCounter');
        cartCounter.style.display = 'flex';
        cartCounter.textContent = pizzas.length;

        customerForm.classList.remove('hide');
        orderContainer.firstElementChild.classList.add('hide');
      });
    });
  });

  pizzaContainer.insertAdjacentHTML(
    'beforeend',
    menu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
  );
  menuContainer.insertAdjacentHTML('beforeend', orderComponent());
  //menuContainer.insertAdjacentHTML('beforeend', '<button id="order">ORDER</button>');
  const orderContainer = document.querySelector('.orderContainer');
  const customerForm = document.getElementById('customerForm');

  customerForm.addEventListener('submit', (event) => {
    event.preventDefault();
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

  cartContainer.addEventListener('click', () =>
    orderContainer.scrollIntoView({ behavior: 'smooth' })
  );
  const addToOrderBtns = Array.from(document.querySelectorAll('.addToOrder'));

  addToOrderBtns.forEach((addToOrderBtn) => {
    addToOrderBtn.addEventListener('click', (event) => {
      const id = Number(event.target.id.split('-')[1]);
      const amount = Number(document.getElementById(`amount-${id}`).value);
      if (amount < 1) return;
      const index = pizzas.findIndex((pizza) => pizza.id === id);
      if (index !== -1) {
        pizzas[index].amount += amount;
      } else {
        pizzas.push({ id, amount });
      }

      const orderPart = document.getElementById('orders');
      removeAllChildren(orderPart);
      orderPart.insertAdjacentHTML('beforeend', cartComponent(pizzas).join(''));

      console.log(pizzas);
      document.querySelectorAll('.removeButton').forEach((item) => {
        item.addEventListener('click', (event) => {
          console.log(parseInt(event.target.id));
          pizzas.forEach((element) =>
            element.id === parseInt(event.target.id)
              ? (element.amount = element.amount - 1)
              : element
          );
          pizzas.forEach((element) =>
            element.amount < 1
              ? pizzas.splice(pizzas.indexOf(element), 1)
              : element
          );
          removeAllChildren(orderPart);
          orderPart.insertAdjacentHTML(
            'beforeend',
            cartComponent(pizzas).join('')
          );
          console.log('hello');
          console.log(pizzas);
        });
      });

      customerForm.classList.remove('hide');
      const cartCounter = document.getElementById('cartCounter');
      cartCounter.style.display = 'flex';
      cartCounter.textContent = pizzas.length;
      orderContainer.firstElementChild.classList.add('hide');
    });
  });
}

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
