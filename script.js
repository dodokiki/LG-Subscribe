const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

const leadForm = document.querySelector(".lead-form");
leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("ขอบคุณสำหรับข้อมูล ทีมงานจะติดต่อกลับเร็วที่สุด");
  leadForm.reset();
});
