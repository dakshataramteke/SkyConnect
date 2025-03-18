(function () {
  var forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      console.log("Validation Page Clicked Submit");
      var passwordToggleIcon = document.querySelector('#eyeshow'); // Select the password toggle icon

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        passwordToggleIcon.style.display = 'none'; // Enable the icon if the form is invalid
        console.log("Invalid Password")
      } else {
        passwordToggleIcon.style.display = 'none'; // Disable the icon if the form is valid
        console.log("Valid Password");
      }

      form.classList.add('was-validated');
      console.log("Clicked")
    }, false);
  });
})();
