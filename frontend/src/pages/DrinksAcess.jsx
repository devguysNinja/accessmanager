import React, { useState, useEffect } from "react";
import ApiRoute from "../config/ApiSettings";

function DrinksAccess() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [drinks, setDrinks] = useState([]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (drink) => {
    const existingDrinkIndex = cart.findIndex((item) => item.drink === drink);
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
        setCart([...cart, { drink: drink, count: 1 }]);
      }
    }
  };

  const removeFromCart = (drinkToRemove) => {
    const updatedCart = cart.filter((drink) => drink.drink !== drinkToRemove);
    setCart(updatedCart);
  };

  const getTotalCount = () => {
    return cart.reduce((total, drink) => total + drink.count, 0);
  };

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await fetch(`${ApiRoute.BASE_URL}/drink-list`);
        if (!response.ok) {
          throw new Error("Failed to fetch drinks");
        }
        const data = await response.json();
        setDrinks(data);
      } catch (error) {
        console.error("Error fetching drinks:", error.message);
      }
    };

    fetchDrinks();
  }, []);

  const filteredDrinks = selectedCategory
    ? drinks.find((category) => category.name === selectedCategory)?.drink_list || []
    : [];

  return (
    <div className="drink-container">
      <div className="row">
        <div className="col-md-8">
          <nav className="navbar navbar-light bg-light">
            <div className="container-fluid">
              <div className="d-flex">
                {drinks.map((category, index) => (
                  <button
                    key={index}
                    className={`btn btn-outline-primary${
                      selectedCategory === category.name ? " active" : ""
                    }`}
                    onClick={() => handleCategorySelect(category.name)}
                    style={{ margin: "5px", fontSize: "20px" }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
          <div className="drink-container">
            {selectedCategory ? (
              <div>
                {filteredDrinks.length > 0 ? (
                  <div className="row">
                    {filteredDrinks.map((drink, index) => (
                      <div className="col-md-3" key={index}>
                        <div className="drink-item">
                          <p className="drink-name">{drink.drink}</p>
                          <div className="col-sm">
                            {/* Use default image path if drink does not have its own image */}
                            <img
                              src={drink.image || "/baileys-min.webp"}
                              alt={drink.drink}
                              onClick={() => addToCart(drink.drink)}
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
                  <p className="no-drinks">No drinks found in the selected category</p>
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
                {cart.map((item, index) => (
                  <li className="list-group-item cart-item" key={index}>
                    {item.drink}{" "}
                    <img
                      src={item.image || "/baileys-min.webp"}
                      alt={item.drink}
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
                      onClick={() => removeFromCart(item.drink)}
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
