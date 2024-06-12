import { SIGNUP_URL, SUPABASE_API_KEY } from "../constants";
import axios from "axios";
import { Form, useActionData, redirect } from "react-router-dom";
import { getUser } from "../utils/getUser";
import styles from "./LoginAndSignup.module.css";
export async function signupLoader() {
  const user = await getUser();
  if (user === null) {
    return null;
  } else {
    return redirect("/");
  }
}

export async function signupAction({ request }) {
  // codprogdummy@mailinator.com --> 201

  // 201
  const formData = await request.formData();
  const newUser = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const confirmPassword = formData.get("confirm-password");
  if (newUser.password !== confirmPassword) {
    return { error: "Passwords must match" };
  }
  try {
    const response = await axios.post(SIGNUP_URL, newUser, {
      headers: {
        apikey: SUPABASE_API_KEY,
        "Content-Type": "application/json",
      },
    });
    const data = response.data;
    if (data.identities && data.identities.length === 0) {
      return { error: "user already exists" };
    }
    return { message: "confirm your email and login" };
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
}
function Signup() {
  const data = useActionData();
  return (
    <div className="container">
      <h2 className={styles.pageHeading}>
        Create your account and start learning
      </h2>
      <Form action="/signup" method="POST" className={styles.form}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" autoComplete="off" id="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" />
        </div>
        <div>
          <label htmlFor="confirm password">Confirm Password</label>
          <input
            type="password"
            name="confirm-password"
            id="confirm-password"
          />
        </div>
        <div>
          <input type="submit" value="Signup" />
          {data?.error && <p>{data.error}</p>}
          {data?.message && <p>{data.message}</p>}
        </div>
      </Form>{" "}
    </div>
  );
}
export default Signup;
