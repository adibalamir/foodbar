function confirmOrderHandler(event){
  $.ajax({
    type: "POST",
    url:"/cart",
    success: function(data){
      if(data.success){
        updateCartOrderPlaced();
      }else{
        updateCartOrderFailed();
      }
    }
  })
};

function removeCartItemHandler(event){
  event.preventDefault();
  var $target = $(event.target);
  var id = $target.attr("id");

  $.ajax({
    type: "POST",
    data: $target.parent().serialize(),
    url: `/cart/items/${id}/delete`,
    success: function(data){
      updateDOMCart(data, $target);
    }
  })
};

function updateCartOrderPlaced(){
  $("#confirm-order").remove();
  var $orderUpdate = $(`
    <div>Order Placed</div>
    <div>Confirmation will be sent via text-message</div>
  `).addClass("order-placed order-update");
  $("footer").append($orderUpdate);
};

function updateCartOrderFailed(){
  $("#confirm-order").remove();
  var $orderUpdate =$(`
    <div>Order Failed</div>
    <div>Please add a few items</div>
  `).addClass("order-failed order-update");
  $("footer").append($orderUpdate);
};

function updateDOMCart(data, $target){
  //subtotal-td tax-td total-td
  $target.closest("tr").remove();
  $("#subtotal-td").html("$" + data.subTotal);
  $("#tax-td").html("$" + data.tax);
  $("#total-td").html("$" + data.total);
  $("#total-footer").html("$" + data.total);

  if(data.total === "0.00"){
    var $container = $(".cart-container").find("section");
    $container.empty();
    $container.append("<h3>Nothing Here!</h3>");
  }
};

function createDOMCart(data){
  var cart = data.cart;
  var cartKeys = Object.keys(cart);

  //the tables for the checkout line items go in <section>
  var $cart = $(`
    <div class="cart-container">
      <header>
        <h1>
          Checkout
        </h1>
      </header>
      <section>
      </section>
      <footer>
        <div id="total-footer">
          Total: &#36;${data.total}
        </div>
        <button id="confirm-order">Confirm Order</button>
      </footer>
    </div>
  `);

  //if cart is not empty, populate table
  if(cartKeys.length > 0){
    var $table=$(`
      <table>
        <tr>
          <th></th>
          <th>Item</th>
          <th>Quantity</th>
          <th class="dollar-value-td">Amount</th>
        </tr>
      </table>
      `);
    cartKeys.forEach((key, i) => {
      var curObj = cart[key];
      var $curRow = $(`
        <tr>
          <td>
            <form id="${key}">
              <input name="item_id" type="hidden" value="${key}">
              <input type="submit" value="remove" class="cart-remove-button">
            </form>
          </td>
          <td>${curObj.item_name}</td>
          <td class="center-align-td">${curObj.quantity}</td>
          <td class="right-align-td">&#36;${(curObj.price * curObj.quantity / 100).toFixed(2)}</td>
        </tr>
      `);
      if(i % 2 === 0) $curRow.addClass("colored-row");
      $table.append($curRow);
    });

    $table.append(`
      <tr class="spacer-row summary-row">
        <td colspan=4></td>
      </tr>
      <tr class="summary-row">
          <td colspan=2></td>
          <td right-align-td>Subtotal: </td>
          <td id="subtotal-td" class="right-align-td">&#36;${data.subTotal}</td>
      </tr>
      <tr class="summary-row">
          <td colspan=2></td>
          <td class="right-align-td">Tax: </td>
          <td id="tax-td" class="right-align-td">&#36;${data.tax}</td>
      </tr>
      <tr class="summary-row">
          <td colspan=2></td>
          <td class="right-align-td">Total: </td>
          <td id="total-td" class="right-align-td">&#36;${data.total}</td>
      </tr>
    `)
    $cart.find("section").append($table);

  //else cart is empty
  }else{

  }
  var $mask = $(`<div class="page-mask"></div>`);
  var $body = $("body");
  $cart.find(".cart-remove-button").on("click", removeCartItemHandler);
  $cart.find("#confirm-order").on("click", confirmOrderHandler);
  $body.prepend($mask);
  $body.prepend($cart);
};

function destroyDOMCart(){
  $(".cart-container").remove();
  $(".page-mask").remove();
};

function cartClickHandler(event){
  $.ajax({
    type: "GET",
    url: "/cart",
    success: function(data){
      createDOMCart(data);
      $(".page-mask").on("click", destroyDOMCart);
    }
  })
};

$(document).ready(function(){
  $(".cart-button").on("click", cartClickHandler);
});
