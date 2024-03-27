import React, { useState, useEffect } from "react";
import ApiRoute from "../config/ApiSettings";
import toast, { Toaster } from "react-hot-toast";

function DrinksAccess() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [payloadData, setPayloadData] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // get values passed from url query string
  const params = new URLSearchParams(window.location.search);
  const paramObj = Object.fromEntries(params);
  const { uid, swipe, used, access, grant } = paramObj;
  const { balance, allowed_access, used_access, employee } = responseData || {};

  const addToCart = (drink) => {
    const existingDrinkIndex = cart.findIndex((item) => item.drink === drink);
    // Check if the drink already exists in the cart
    if (existingDrinkIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingDrinkIndex].count += 1;
      setCart(updatedCart);
    } else {
      if (cart.length >= paramObj.drink) {
        toast.error("You can't add more than 2 drinks to the cart");
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

  const accessBoard = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/access-gate`);
  };

  useEffect(() => {
    if (responseData && !responseData.error) {
      const timeout = setTimeout(() => {
        window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/access-gate`);
      }, 4000);
    }
    return (timeout) => clearTimeout(timeout);
  });

  const DRINK_CART_URL = `${ApiRoute.TRANSACTION_DRINK_CART_URL}`;

  const postPayloadToBackend = async () => {
    try {
      setIsCheckingOut(true);

      const payload = {
        cart_item: cart.reduce((acc, item) => {
          acc[item.drink] = item.count;
          return acc;
        }, {}),
        grant_type: grant,
        access_point: access,
        used_count: used,
        swipe_count: swipe,
        owner_profile: uid,
      };

      const response = await fetch(DRINK_CART_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to checkout");
      }
      const data = await response.json();
      setResponseData(data);
      console.log("Checkout successful!", data);
      toast.success("Checkout successful!");

      setCart([]);
      setIsCheckingOut(false);
    } catch (error) {
      console.error("Error during checkout:", error.message);
      toast.error("Error during checkout");
      setIsCheckingOut(false);
    }
  };

  // Update payloadData whenever cart changes
  useEffect(() => {
    setPayloadData(cart);
  }, [cart]);

  const filteredDrinks = selectedCategory
    ? drinks.find((category) => category.name === selectedCategory)
        ?.drink_list || []
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
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      overflowX: "auto",
                      overflowY: "auto",
                      maxHeight: "600px",
                      maxWidth: "900px",
                    }}
                  >
                    {filteredDrinks.map((drink, index) => (
                      <div key={index}>
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
                  {getTotalCount() <= paramObj.drink && (
                    <button
                      className="btn btn-success btn-sm float-end checkout-button"
                      onClick={postPayloadToBackend}
                      disabled={isCheckingOut}
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
          {responseData && (
            <div
              style={{
                marginTop: "25px",
                borderRadius: "5px",
                padding: "20px",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Name: {employee}
                </p>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Allowed Access: {allowed_access}
                </p>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Balance: {balance}
                </p>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Used Access: {used_access}
                </p>
              </div>

              <button
                style={{
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={accessBoard}
              >
                Take Your Drink(s)
              </button>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default DrinksAccess;
