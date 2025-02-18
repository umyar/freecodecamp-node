const form = document.getElementById('original-url-form');
const resultDiv = document.querySelector('.short-url');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  handleFormSubmit();
});

function handleFormSubmit() {
  const urlInput = document.getElementById('url_input').value;

  fetch('api/shorturl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: urlInput }), // Send the form data as JSON
  })
    .then(response => response.json())
    .then(data => {
      resultDiv.innerHTML = '';
      resultDiv.appendChild(getMessageContent(Boolean(data.short_url), data.short_url || data.error));
    })
    .catch(error => {
      resultDiv.innerHTML = '';
      resultDiv.appendChild(getMessageContent(false, error));
    });
}

function getMessageContent(success, message) {
  const span = document.createElement('span');

  if (success) {
    span.setAttribute('class', 'success');
  } else {
    span.setAttribute('class', 'error');
  }

  span.innerText = message;
  return span;
}
