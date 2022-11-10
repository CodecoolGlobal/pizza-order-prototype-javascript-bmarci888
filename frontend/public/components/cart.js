const cartComponent = (pizzas, menu) =>
  pizzas.map(
    (element) => `
  <p>${element.amount}  ${menu[element.id - 1].name}   <button id="${
      element.id
    }" class="removeButton buttons">Remove</button></p>
  `
  );

export { cartComponent };
