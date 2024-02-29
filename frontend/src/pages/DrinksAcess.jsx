import React, { useState } from "react";

function DrinksAccess() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  // Dummy drinks data
  const dummyDrinks = [
    {
      id: 1,
      name: "Gordons",
      category: "Spirit",
      image: "/gordons-gin-and-tonic.webp",
    },
    {
      id: 2,
      name: "Baileys",
      category: "Spirit",
      image: "/baileys-min.webp",
    },
    {
      id: 3,
      name: "Guinness",
      category: "Beer",
      image: "/holding-glass-guinness.webp",
    },
    {
      id: 4,
      name: "Johnie-Walker",
      category: "Spirit",
      image: "/johnnie-walker-black-label-cocktail.webp",
    },
    {
      id: 5,
      name: "Smirnoff",
      category: "Spirit",
      image: "/smirnoff-min.webp",
    },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (drink) => {
    const existingDrinkIndex = cart.findIndex((item) => item.id === drink.id);
    // Check if the drink already exists in the cart
    if (existingDrinkIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingDrinkIndex].count += 1; // Increment the count of the existing drink
      setCart(updatedCart);
    } else {
      if (cart.length >= 2) {
        alert("You can't add more than 2 drinks to the cart");
      } else {
        // add the drink to the cart with count = 1
        setCart([...cart, { ...drink, count: 1 }]);
      }
    }
  };

  const removeFromCart = (drinkToRemove) => {
    const updatedCart = cart.filter((drink) => drink.id !== drinkToRemove.id);
    setCart(updatedCart);
  };

  const getTotalCount = () => {
    return cart.reduce((total, drink) => total + drink.count, 0);
  };

  const filteredDrinks = selectedCategory
    ? dummyDrinks.filter((drink) => drink.category === selectedCategory)
    : [];

  return (
    <div className="drink-container">
      <div className="row">
        <div className="col-md-8">
          <nav className="navbar navbar-light bg-light">
            <div className="container-fluid">
              <div className="d-flex">
                {["Spirit", "Beer", "Wine", "Soft Drinks"].map(
                  (category, index) => (
                    <button
                      key={index}
                      className={`btn btn-outline-primary${
                        selectedCategory === category ? " active" : ""
                      }`}
                      onClick={() => handleCategorySelect(category)}
                      style={{ margin: "5px" }}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>
          </nav>
          <div className="drink-container">
            {selectedCategory ? (
              <div>
                {filteredDrinks.length > 0 ? (
                  <div className="row">
                    {filteredDrinks.map((drink) => (
                      <div className="col-md-3" key={drink.id}>
                        <div className="drink-item">
                          <p className="drink-name">{drink.name}</p>
                          <div className="col-sm">
                            <img
                              src={drink.image}
                              alt={drink.name}
                              onClick={() => addToCart(drink)}
                              className="drink-image"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "5px",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-drinks">
                    No drinks found in the selected category
                  </p>
                )}
              </div>
            ) : (
              <p className="select-category">Please select a category</p>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="cart-container">
            <h2 className="cart-title">Cart</h2>
            {cart.length > 0 ? (
              <ul className="list-group">
                {cart.map((item) => (
                  <li className="list-group-item cart-item" key={item.id}>
                    {item.name}{" "}
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "10px",
                        borderRadius: "5px",
                      }}
                    />
                    <span className="cart-item-count">x{item.count}</span>{" "}
                    <button
                      className="btn btn-danger btn-sm float-end"
                      onClick={() => removeFromCart(item)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
                <li className="list-group-item cart-total">
                  Total: {getTotalCount()}
                  {getTotalCount() <= 2 && (
                    <button
                      className="btn btn-success btn-sm float-end checkout-button"
                      onClick={() => alert("Checkout successful!")}
                    >
                      Checkout
                    </button>
                  )}
                </li>
              </ul>
            ) : (
              <p>Your cart is empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrinksAccess;
