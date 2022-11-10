const orderComponent = () => {
  return `
  <div class="orderContainer">
    <p>There's no pizza in your cart, please put at least one in it.</p>
    <div id="orders"></div>
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

export { orderComponent };
