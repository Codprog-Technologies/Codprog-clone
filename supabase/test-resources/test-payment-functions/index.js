document.addEventListener("DOMContentLoaded", async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const publishableKey = "<stripe-publishable-key>";

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
      "https://<project-ref-id>.supabase.co/functions/v1/create-stripe-payment",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer <user-access-token>",
          "apiKey": "<anon-key>",
        },
        // Send any necessary data to your server to create the Payment Intent
        body: JSON.stringify({
          course_id: 4,
        }),
      },
    );
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    addMessage("Error creating Payment Intent:" + error);
    return null;
  }
};
