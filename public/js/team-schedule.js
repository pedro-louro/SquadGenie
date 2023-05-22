document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.btn.btn-primary.save-date');

  const saveDate = function (event) {
    const input = event.target.previousElementSibling;
    const teamId = event.target.getAttribute('data-teamid');
    const selectedDate = input.value;

    // Send the selected date to the server
    fetch('/teams/save-date', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamId, selectedDate })
    }).then(function (response) {
      // Handle the response if needed
      if (response.ok) {
        // Optionally update the input value after successful save
        input.value = selectedDate;
        location.reload();
      }
    });
  };

  buttons.forEach(function (button) {
    button.addEventListener('click', saveDate);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.datepicker-input');

  inputs.forEach(input => {
    flatpickr(input, {
      altInput: true,
      dateFormat: 'd-m-Y H:i',
      minDate: 'today',
      locale: {
        firstDayOfWeek: 1
      }
    });
  });
});
