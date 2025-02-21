// Array of image URLs
const allCollection = [
  "images/collection-1.jpeg",
  "images/collection-2.jpeg",
  "images/collection-3.jpeg",
  "images/collection-4.jpeg",
  "images/collection-5.jpeg",
  "images/collection-6.jpeg",
  "images/collection-7.jpeg",
  "images/collection-8.jpeg",
  "images/collection-9.jpeg",
  "images/collection-10.jpeg",
  "images/collection-11.jpeg",
];

const trending = [
  "images/trending-1.jpeg",
  "images/trending-2.jpeg",
  "images/trending-3.jpeg",
  "images/trending-4.jpeg",
  "images/trending-5.jpeg",
  "images/trending-6.jpeg",
  "images/trending-7.jpeg",
  "images/trending-8.jpeg",
  "images/trending-9.jpeg",
  "images/trending-10.jpeg",
  "images/trending-11.jpeg",
];

// Function to initialize a slider
function initializeSlider(containerClass, images, itemsPerSlide) {
  const container = document.querySelector(`.${containerClass}`);
  let currentIndex = 0;

  // Function to group images into sets
  function createSlides(images, itemsPerSlide) {
    const slides = [];
    for (let i = 0; i < images.length; i += itemsPerSlide) {
      const slide = images.slice(i, i + itemsPerSlide);
      slides.push(slide);
    }
    return slides;
  }

  const slides = createSlides(images, itemsPerSlide);

  // Dynamically create and append slides
  slides.forEach((slide) => {
    const slideElement = document.createElement("div");
    slideElement.className = `${containerClass.replace("-container", "-item")}`;

    slide.forEach((image) => {
      const imgElement = document.createElement("img");
      imgElement.src = image;
      imgElement.alt = "Slide Image";
      slideElement.appendChild(imgElement);
    });

    // If a slide has fewer than 3 images, fill the remaining space with empty divs
    while (slideElement.children.length < itemsPerSlide) {
      const emptyElement = document.createElement("div");
      emptyElement.style.width = `${100 / itemsPerSlide}%`; // Match the width of the images
      slideElement.appendChild(emptyElement);
    }

    container.appendChild(slideElement);
  });

  // Function to show the current slide
  function showSlide(index) {
    const offset = -index * 100; // Move the container by 100% per slide
    container.style.transform = `translateX(${offset}%)`;
  }

  // Function to move to the next slide
  function nextSlide() {
    currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    showSlide(currentIndex);
  }

  // Automatically transition to the next slide every 3 seconds
  setInterval(nextSlide, 3000);

  // Initialize the first slide
  showSlide(currentIndex);
}

// Initialize the collection slider
initializeSlider("collection-container", allCollection, 3);

// Initialize the trending slider
initializeSlider("trending-container", trending, 3);
