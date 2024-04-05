import axios from "axios";
import { GET_ALL_COURSES, SUPABASE_API_KEY } from "../constants";
import { Link, useLoaderData } from "react-router-dom";

export async function homeLoader() {
  const { data } = await axios.get(GET_ALL_COURSES, {
    headers: {
      apikey: SUPABASE_API_KEY,
    },
  });
  return data;
}
function Home() {
  const courses = useLoaderData();
  return (
    <div>
      <h1>Home</h1>
      {courses.map((course) => {
        const { name, amount, currency, description, id } = course;

        return (
          <div key={id}>
            <p>name : {name}</p>
            <p>
              price : {amount} {currency}
            </p>
            <p>description: {description}</p>
            <Link to={`/course-detail/${id}`}>View Course</Link>
            <hr />
          </div>
        );
      })}
    </div>
  );
}
export default Home;
