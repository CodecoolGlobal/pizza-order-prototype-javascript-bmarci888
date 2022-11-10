import { pizzaComponent } from './components/pizza.js';
import { orderComponent } from './components/order.js';
import { homeComponent } from './components/home.js';
import { menuComponent } from './components/menu.js';
import { cartComponent } from './components/cart.js';

const root = document.getElementById('root');

window.addEventListener('load', () => {
  switch (window.location.pathname) {
    case '/pizza/list':
      pizzaMenu();
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

async function pizzaMenu() {
  const menu = await (await fetch('/api/pizza')).json();
  const allergens = await (await fetch('/api/allergens')).json();

  let pizzas = [];
  const chosenAllergens = [];

  root.insertAdjacentHTML('afterbegin', menuComponent(allergens));
  const menuContainer = document.querySelector('.menuContainer');
  const pizzaContainer = document.querySelector('.pizzaContainer');
  const filterContainer = document.querySelector('.filterContainer');
  const cartContainer = document.querySelector('.cartContainer');
  const cartCounter = document.getElementById('cartCounter');

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

    const filteredMenu = menu.filter(
      (pizza) =>
        !pizza.allergens.some((allergen) => chosenAllergens.includes(allergen))
    );

    removeAllChildren(pizzaContainer);

    pizzaContainer.insertAdjacentHTML(
      'beforeend',
      filteredMenu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
    );
    prepareAddToOrderBtns(
      pizzas,
      menu,
      orderContainer,
      cartCounter,
      customerForm
    );
  });

  pizzaContainer.insertAdjacentHTML(
    'beforeend',
    menu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
  );
  menuContainer.insertAdjacentHTML('beforeend', orderComponent());
  const orderContainer = document.querySelector('.orderContainer');
  const customerForm = document.getElementById('customerForm');

  customerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const city = document.getElementById('customerCity').value;
    const street = document.getElementById('customerStreet').value;

    try {
      console.log(pizzas, 'orderBtn');
      const response = await postOrder(pizzas, name, email, city, street);
      if (response.ok) {
        document.getElementById('orders').classList.add('hide');
        customerForm.classList.add('hide');
        orderContainer.firstElementChild.classList.remove('hide');
        orderContainer.firstElementChild.textContent =
          'Thank you for order. Pizza will be on the way soon.';
        pizzas = [];
        cartCounter.textContent = pizzas.length;
      }
    } catch (err) {
      console.log(err);
      orderContainer.firstElementChild.classList.remove('hide');
      orderContainer.firstElementChild.textContent =
        'Sorry, something went wrong. Please try again later!';
    }
  });

  cartContainer.addEventListener('click', () =>
    orderContainer.scrollIntoView({ behavior: 'smooth' })
  );

  prepareAddToOrderBtns(
    pizzas,
    menu,
    orderContainer,
    cartCounter,
    customerForm
  );
}

function prepareAddToOrderBtns(
  pizzas,
  menu,
  orderContainer,
  cartCounter,
  customerForm
) {
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

      console.log(pizzas, 'afteradded');

      const orderPart = document.getElementById('orders');
      removeAllChildren(orderPart);
      orderPart.insertAdjacentHTML(
        'beforeend',
        cartComponent(pizzas, menu).join('')
      );

      document.querySelectorAll('.removeButton').forEach((item) => {
        item.addEventListener('click', (event) =>
          removeOrder(event, pizzas, menu, orderContainer, orderPart)
        );
      });

      customerForm.classList.remove('hide');
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

function removeOrder(event, pizzas, menu, orderContainer, orderPart) {
  const indexOfRemoved = pizzas.findIndex(
    (pizza) => pizza.id === Number(event.target.id)
  );

  pizzas[indexOfRemoved].amount -= 1;
  if (pizzas[indexOfRemoved].amount < 1) pizzas.splice(indexOfRemoved, 1);
  if (pizzas.length === 0) {
    cartCounter.style.display = 'none';
    customerForm.classList.add('hide');
    orderContainer.firstElementChild.classList.remove('hide');
  } else {
    cartCounter.textContent = pizzas.length;
  }
  removeAllChildren(orderPart);
  orderPart.insertAdjacentHTML(
    'beforeend',
    cartComponent(pizzas, menu).join('')
  );

  document.querySelectorAll('.removeButton').forEach((item) => {
    item.addEventListener('click', (event) =>
      removeOrder(event, pizzas, menu, orderContainer, orderPart)
    );
  });
}

function postOrder(pizzas, name, email, city, street) {
  const now = new Date();
  const [year, month, day, hour, minute] = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  ];

  return fetch('/api/order', {
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
}
