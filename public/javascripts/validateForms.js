// Bootstrap stuff...
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // For bootstrap script bs-custom-file-input.. Will not work with current bootstrap
    // bsCustomFileInput.init();

    // Fetch all the forms we want to apply custom Bootstrap validation styles to

    const forms = document.querySelectorAll('.validated-form')

    // For each form found with this class, add event listener for Submit

    // Make an array from forms
    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()