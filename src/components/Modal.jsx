import strawberry from "../assets/Strawberry_Mojito_Mocktail_Recipe.webp";
import ProgressiveImage from "./ProgressiveImage";

export default function Modal({
  src = strawberry || "images/geae.webp",
  name = "Avocado Smoothie",
  price = 355,
  categories,
  tag,
  desc,
  onClose,
  isSpecial,
  // isVisible = false,
}) {

  return (
    <section
      className="display"
      // style={{ display: isVisible ? "flex" : "none" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        fill="currentColor"
        className="bi bi-x"
        viewBox="0 0 16 16"
        onClick={() => {
          onClose();
        }}
      >
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
      </svg>
      <div className="display-img-container">
        <ProgressiveImage image={src} alt={name} className="display-img" />
      </div>
      <div className="display-details">
        <br />
        <div className="name-price">
          <h3 className="display-name">
            {name}{" "}
            {isSpecial ? (
              <span className="special">
                <span></span>
                <p>Special</p>
              </span>
            ) : (
              ""
            )}{" "}
          </h3>
            {/* <p className="display-price">
              {price} <span>br</span>
            </p> */}
        </div>
        <div className="categories">
          <p>
            <em>{categories}</em>
            {tag && tag != categories && <em>{tag}</em>}
          </p>
        </div>
        <br />
        {desc && <h4>Ingredients:</h4>}
        <p className="display-description">{desc}</p>
      </div>
    </section>
  );
}
