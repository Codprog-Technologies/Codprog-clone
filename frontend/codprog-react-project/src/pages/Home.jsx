// fetch all the courses in homepage

import heroImage from "../assets/hero.svg";
import thumbnail from "../assets/thumbnail.svg";
import rupee from "../assets/rupee.svg";
import { Link, useLoaderData } from "react-router-dom";
import styles from "./Home.module.css";
import axios from "axios";
import { GET_ALL_COURSES, SUPABASE_API_KEY } from "../constants";
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
    <div className="container">
      <section className={styles.hero}>
        <div className="heroContent">
          <h1 className={styles.heroHeading}>
            We teach everything{" "}
            <span className={styles.fromScratch}>from scratch. </span>
          </h1>
          <p className={styles.heroSubHeading}>
            And make sure you understand everything
          </p>
          <button className={styles.heroButton}>Start Learning</button>
        </div>

        <img
          src={heroImage}
          className={styles.heroImage}
          alt="A person looking at the computer screen"
        />
      </section>
      <section className={styles.courseSection}>
        <h1 className={styles.courseSectionHeading}>
          Our Most Popular Courses
        </h1>
        <div className={styles.courseCards}>
          {courses.map((course) => {
            const { name, amount, description, id } = course;
            return (
              <div key={id} className={styles.courseCard}>
                <img
                  src={thumbnail}
                  alt="Course generic thumbnail"
                  className={styles.thumbnail}
                />
                <h2>{name}</h2>
                <p className={styles.coursePrice}>
                  <img src={rupee} alt="Rupee Symbol" /> {amount}
                </p>
                <p>{description}</p>
                <Link
                  to={`/course-detail/${id}?name=${name}`}
                  className={styles.moreInfoBtn}
                >
                  View Course
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
export default Home;
