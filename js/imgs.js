// Array of image URLs
const allCollection = [
  "images/collection-1.jpg",
  "images/collection-2.jpg",
  "images/collection-3.jpg",
  "images/collection-4.jpg",
  "images/collection-5.jpg",
  "images/collection-6.jpg",
  "images/collection-7.jpg",
  "images/collection-8.jpg",
  "images/collection-9.jpg",
  "images/collection-10.jpg",
  "images/collection-11.jpg",
  "images/collection-12.jpg",
];

const trending = [
  "images/trending-1.jpg",
  "images/trending-2.jpg",
  "images/trending-3.jpg",
  "images/trending-4.jpg",
  "images/trending-5.jpg",
  "images/trending-6.jpg",
  "images/trending-7.jpg",
  "images/trending-8.jpg",
  "images/trending-9.jpg",
  "images/trending-10.jpg",
  "images/trending-11.jpg",
  "images/trending-12.jpg",
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
