import axios from "axios";
import { BASE_URL, SUPABASE_API_KEY } from "../constants";
import { Link, useLoaderData } from "react-router-dom";

export async function courseDetailLoader({ params }) {
  const { id: courseID } = params;
  const URL = `${BASE_URL}rest/v1/modules?course_id=eq.${courseID}&select=*`;
  const { data: modules } = await axios.get(URL, {
    headers: { apikey: SUPABASE_API_KEY },
  });
  return { modules, courseID };
}
function CourseDetail() {
  const { modules, courseID } = useLoaderData();
  return (
    <div>
      {JSON.stringify(modules)}
      <br />
      <Link to={`/payment/${courseID}`}>Buy Now</Link>
    </div>
  );
}
export default CourseDetail;
