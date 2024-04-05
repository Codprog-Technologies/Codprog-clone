document.addEventListener("DOMContentLoaded", async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const publishableKey =
    "pk_test_51NA7b5SEmnOPh2TgPHyzbCZM0LAJr0DHG9eFlfDUXLQ1l544fwOXRi1inCzKZ7rpX7pqzZcf2iSEHpHXjlLFC6jJ00HQQmrA3x";

  const stripe = Stripe(publishableKey, {
    apiVersion: "2020-08-27",
  });

  // On page load, we create a PaymentIntent on the server so that we have its clientSecret to
  // initialize the instance of Elements below. The PaymentIntent settings configure which payment
  // method types to display in the PaymentElement.
  const clientSecret = await createPaymentIntent();

  addMessage(`Client secret returned.`);

  // Initialize Stripe Elements with the PaymentIntent's clientSecret,
  // then mount the payment element.
  const elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
  // Create and mount the linkAuthentication Element to enable autofilling customer payment details
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");
  // If the customer's email is known when the page is loaded, you can
  // pass the email to the linkAuthenticationElement on mount:
  //
  //   linkAuthenticationElement.mount("#link-authentication-element",  {
  //     defaultValues: {
  //       email: 'jenny.rosen@example.com',
  //     }
  //   })
  // If you need access to the email address entered:
  //
  //  linkAuthenticationElement.on('change', (event) => {
  //    const email = event.value.email;
  //    console.log({ email });
  //  })

  // When the form is submitted...
  const form = document.getElementById("payment-form");
  let submitted = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if (submitted) return;
    submitted = true;
    form.querySelector("button").disabled = true;

    // Confirm the payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/return.html`,
      },
    });

    if (stripeError) {
      addMessage(stripeError.message);

      // reenable the form.
      submitted = false;
      form.querySelector("button").disabled = false;
      return;
    }
  });
});

const createPaymentIntent = async () => {
  try {
    const response = await fetch(
      "https://orfqhbdeqtusogzodofb.supabase.co/functions/v1/create-stripe-payment",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6Im4rRis0cGdZaXIwN2xoNFgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzEwOTIwNDg3LCJpYXQiOjE3MTA5MTY4ODcsImlzcyI6Imh0dHBzOi8vb3JmcWhiZGVxdHVzb2d6b2RvZmIuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjM3MWU2Njc5LTFiNzAtNDM0YS05Zjc2LTNkYjk2ZWQ4NjJlOSIsImVtYWlsIjoiZHVtbXlAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MTA5MTY4ODd9XSwic2Vzc2lvbl9pZCI6ImQ2Y2U5YWU1LTVhYmEtNGE5NS1iZjkzLTIwNmUyYWQ1NGU5MyIsImlzX2Fub255bW91cyI6ZmFsc2V9.E296rFpngz4FiBmneLsBNujTfUfHeXiZMoHyGmXSkB4",
          apiKey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZnFoYmRlcXR1c29nem9kb2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIyMDM5MzQsImV4cCI6MjAxNzc3OTkzNH0.lPpNrQwmEyVK2hcmH24-w0m78yRQjvqMlj2tK73tThw",
        },
        // Send any necessary data to your server to create the Payment Intent
        body: JSON.stringify({
          course_id: 2,
        }),
      }
    );
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    return null;
  }
};
