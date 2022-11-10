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

// Display home page
function home() {
  root.insertAdjacentHTML('afterbegin', homeComponent());
}

// Display pizza menu page
async function pizzaMenu() {
  // Fetch data
  const menu = await (await fetch('/api/pizza')).json();
  const allergens = await (await fetch('/api/allergens')).json();

  // Orderd pizzas
  let pizzas = [];
  // Filtered allergens
  const chosenAllergens = [];

  // Add skeleton
  root.insertAdjacentHTML('afterbegin', menuComponent(allergens));

  const menuContainer = document.querySelector('.menuContainer');
  const pizzaContainer = document.querySelector('.pizzaContainer');
  const filterContainer = document.querySelector('.filterContainer');
  const cartContainer = document.querySelector('.cartContainer');
  const cartCounter = document.getElementById('cartCounter');

  // Add click event listener to filter buttons
  filterContainer.addEventListener('click', (event) => {
    if (!event.target.id) return;
    // Get clicked allergen id
    const id = Number(event.target.id.split('-')[1]);
    const filterBtnClasses = document.getElementById(
      `allergen-${id}`
    ).classList;
    // Change appearence based on chosen status
    filterBtnClasses.contains('filterBtnActive')
      ? filterBtnClasses.remove('filterBtnActive')
      : filterBtnClasses.add('filterBtnActive');
    // Add/Remove allergen to/from chosenAllergens
    const indexOfchosenAllergens = chosenAllergens.findIndex(
      (element) => element === id
    );
    indexOfchosenAllergens === -1
      ? chosenAllergens.push(id)
      : chosenAllergens.splice(indexOfchosenAllergens, 1);

    // Filter out pizzas by chosen allergens
    const filteredMenu = menu.filter(
      (pizza) =>
        !pizza.allergens.some((allergen) => chosenAllergens.includes(allergen))
    );

    // Update DOM
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

  // Add pizza cards to the container
  pizzaContainer.insertAdjacentHTML(
    'beforeend',
    menu.map((pizza) => pizzaComponent(pizza, allergens)).join('')
  );
  // Add order component to the container
  menuContainer.insertAdjacentHTML('beforeend', orderComponent());
  const orderContainer = document.querySelector('.orderContainer');
  const customerForm = document.getElementById('customerForm');

  // Handle form submition
  customerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const city = document.getElementById('customerCity').value;
    const street = document.getElementById('customerStreet').value;

    try {
      console.log(pizzas, 'orderBtn');
      // Send POST request to /api/order
      const response = await postOrder(pizzas, name, email, city, street);
      if (response.ok) {
        document.getElementById('orders').classList.add('hide');
        customerForm.classList.add('hide');
        orderContainer.firstElementChild.classList.remove('hide');
        orderContainer.firstElementChild.textContent =
          'Thank you for order. Pizza will be on the way soon.';
        pizzas = [];
        cartCounter.textContent = pizzas.length;
        cartCounter.style.display = 'none';
      }
    } catch (err) {
      console.log(err);
      document.getElementById('orders').classList.add('hide');
      customerForm.classList.add('hide');
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
  // Handle pizzas array content and display it accordingly
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

      // Update DOM
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

// Remove/Decrease amount of ordered pizzas
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
  // Update DOM
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
