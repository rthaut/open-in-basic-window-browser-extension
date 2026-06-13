const modal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#image-modal-img");
const modalTitle = document.querySelector("#image-modal-title");
const modalLink = document.querySelector("#image-modal-link");
let lastFocusedElement = null;

function closeModal() {
  modal.hidden = true;
  modalImage.removeAttribute("src");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function openModal(button) {
  const imageSrc = button.dataset.fullImage;
  const caption = button.dataset.caption;
  const imageAlt = button.querySelector("img")?.alt ?? caption;

  lastFocusedElement = document.activeElement;
  modalImage.src = imageSrc;
  modalImage.alt = imageAlt;
  modalTitle.textContent = caption;
  modalLink.href = imageSrc;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector("[data-close-modal]").focus();
}

document.querySelectorAll(".screenshot-button").forEach((button) => {
  button.addEventListener("click", () => openModal(button));
});

modal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (!modal.hidden && event.key === "Escape") {
    closeModal();
  }
});
