document.addEventListener("DOMContentLoaded", function () {
  const digitInputs = document.querySelectorAll("[data-digits-only]");

  digitInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      const maxLength = Number(input.getAttribute("maxlength")) || 12;
      input.value = input.value.replace(/\D/g, "").slice(0, maxLength);
    });
  });

  const autoHideAlerts = document.querySelectorAll("[data-auto-hide='true']");

  autoHideAlerts.forEach(function (alertElement) {
    window.setTimeout(function () {
      alertElement.classList.add("opacity-0");
      window.setTimeout(function () {
        alertElement.remove();
      }, 300);
    }, 3500);
  });
});
