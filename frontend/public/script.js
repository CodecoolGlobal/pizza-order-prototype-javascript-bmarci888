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

  const pizzas = [];
  const chosenAllergens = [];

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

    const filteredMenu = menu.filter(
      (pizza) =>
        !pizza.allergens.some((allergen) => chosenAllergens.includes(allergen))
    );

    removeAllChildren(pizzaContainer);

    pizzaContainer.insertAdjacentHTML(
      'beforeend',
      filteredMenu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
    );
    prepareAddToOrderBtns(pizzas, menu, orderContainer);
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

    const response = await postOrder(pizzas, name, email, city, street);
    console.log(response);
  });

  cartContainer.addEventListener('click', () =>
    orderContainer.scrollIntoView({ behavior: 'smooth' })
  );

  prepareAddToOrderBtns(pizzas, menu, orderContainer);
}

function prepareAddToOrderBtns(pizzas, menu, orderContainer) {
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
      orderPart.insertAdjacentHTML(
        'beforeend',
        cartComponent(pizzas, menu).join('')
      );

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
            cartComponent(pizzas, menu).join('')
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
