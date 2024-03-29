import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "../App.css";

const Home = (props) => {
  const images = [
    { src: './fufu.avif', alt: 'Fufu' },
    { src: './amara.webp', alt: 'Amara' },
    { src: './eba.webp', alt: 'Eba' },
  ];

  return (
    <div className="background-container">
      <div className="carousel-container">
        <Carousel fade style={{ height: "500px", width: "90%" }}>
          {images.map((image, index) => (
            <Carousel.Item key={index}>
              <div className="image-container">
                <img
                  className="d-block img-fluid"
                  src={image.src}
                  alt={image.alt}
                />
              </div>
              {/* <Carousel.Caption>
                <h3>{image.alt}</h3>
              </Carousel.Caption> */}
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Home;
