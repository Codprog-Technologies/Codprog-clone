import { requireAuth } from "../utils/requireAuth";
import isTokenExpired from "../utils/isTokenExpired";
import refreshToken from "../utils/refreshToken";
import { getUser } from "../utils/getUser";
import { BASE_URL, SUPABASE_API_KEY } from "../constants";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
export async function myCourseLoader({ request }) {
  const pathname = new URL(request.url).pathname;
  await requireAuth({ redirectTo: pathname });
  let { access_token, user_id, expires_at } = await getUser();

  if (isTokenExpired(expires_at)) {
    access_token = await refreshToken();
  }
  const subscriptionsEndpoint = `${BASE_URL}rest/v1/subscriptions?user_id=eq.${user_id}&select=*`;
  const { data: subscriptions } = await axios.get(subscriptionsEndpoint, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      apikey: SUPABASE_API_KEY,
    },
  });
  const coursesNumbers = subscriptions
    .map((course) => `"${course.course_id}"`)
    .join(",");
  const myCoursesEndpoint = `${BASE_URL}rest/v1/courses?id=in.%28${coursesNumbers}%29`;
  const { data: myCourses } = await axios.get(myCoursesEndpoint, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      apikey: SUPABASE_API_KEY,
    },
  });
  console.log("myCourses", myCourses);
  return myCourses;
}
function MyCourses() {
  const myCourses = useLoaderData();
  return (
    <div>
      {myCourses.map((course) => {
        return <div key={course.id}> Name : {course.name}</div>;
      })}
    </div>
  );
}
export default MyCourses;
