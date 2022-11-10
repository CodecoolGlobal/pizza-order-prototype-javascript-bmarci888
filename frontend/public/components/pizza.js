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

export { pizzaComponent };
