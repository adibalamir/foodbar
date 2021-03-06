//Ajax post to add clicked item to user's cart
function addMenuItemHandler(event){
  event.preventDefault();
  var $target = $(event.target);
  var id = $target.attr("id");
  var $submitButton = $target.children(".add-to-cart");
  $submitButton.addClass('button-anim');
  $submitButton.on("animationend", function(){
    $submitButton.removeClass('button-anim');
  })

  $.ajax({
    type: "POST",
    data: $target.serialize(),
    url: `/cart/items/${id}`,
    success: function(data){
      console.log("data sent back from server: ", data);
    }
  })
}

function createMenuItem(dataRow){
  var formattedPrice = (dataRow.price / 100).toFixed(2);
  var $item = $(`
    <div class="menu-item">
      <div class="item-img-container">
        <img src=${dataRow.url}>
      </div>
      <div class="item-description-container">
        <h4>
          ${dataRow.item_name}
        </h4>
        <div>
          ${dataRow.description}
        </div>
        <div class="item-form-container">
          <div class="price">
            ${formattedPrice}
          </div>
          <div>
            <form id="${dataRow.item_id}">
              <input name="item_name" type="hidden" value="${dataRow.item_name}">
              <input name="price" type="hidden" value=${dataRow.price}>
              <input name="quantity" type="text" value=1>
              <input type="submit" value="Add" class="add-to-cart">
            </form>
          </div>
        </div>
      </div>
    </div>
  `);
  $item.find("form").on("submit", addMenuItemHandler);
  return $item;
};

function createCategoryHeading(category){
  return `
    <div>
      <h2>
        ${category[0].toUpperCase() + category.slice(1)}
      </h2>
    </div>
  `
};

$(document).ready(function(){
  $(".menu_img").on("click", function(event){
    var $target = $(event.target);
    var menu_id = $target.attr("menu_id");

    $.get(`/menus/${menu_id}`, function(data){
      var $container = $(".menu-item-container");
      $container.empty();
      for(category of ["appetizers", "mains", "beverages"]){
        var $heading = createCategoryHeading(category);
        $container.append($heading);
        console.log(data[category][0])

        curMenuArr = data[category].sort((a, b) => {
          return a.item_name > b.item_name;
        });
        curMenuArr.forEach(elem => {
          let $curItem = createMenuItem(elem)
          $container.append($curItem);
        })
      }
    })
  })
});