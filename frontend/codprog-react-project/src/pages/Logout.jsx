import axios from "axios";
import { redirect } from "react-router-dom";
import { LOGOUT_URL, SUPABASE_API_KEY } from "../constants";
import { getUser } from "../utils/getUser";
export async function logoutAction() {
  // logout
  // logout api
  const user = await getUser();
  await axios.post(LOGOUT_URL, null, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${user.access_token}`,
      "Content-Type": "application/json",
    },
  });
  localStorage.removeItem("user");
  // clear user from local storage

  return redirect("/");
}
