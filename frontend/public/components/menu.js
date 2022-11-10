const menuComponent = (allergens) => {
  return `
  <div class="cartContainer">
    <img id="cartImg" src="/public/assets/cart.svg" alt="cart">
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

export { menuComponent };
