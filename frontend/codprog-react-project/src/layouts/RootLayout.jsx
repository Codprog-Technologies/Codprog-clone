import { NavLink, Outlet, Form, useRouteLoaderData } from "react-router-dom";
import styles from "./RootLayout.module.css";
import logoutSvg from "../assets/logout.svg";
function RootLayout() {
  const user = useRouteLoaderData("parentRoute");
  return (
    <>
      <header>
        <nav className={`${styles.nav} container`}>
          <h1 className={styles.logo}>
            <NavLink to="/">
              <span className={styles.cod}>Cod</span>
              <span className={styles.prog}>Prog</span>{" "}
            </NavLink>
          </h1>
          <ul className={styles.navItems}>
            <li>
              <NavLink to="about"> About</NavLink>
            </li>
            {/* {user && (
              <li>
                <NavLink to="profile"> Profile</NavLink>
              </li>
            )} */}

            {user && (
              <li>
                <NavLink to="my-courses"> My Courses</NavLink>
              </li>
            )}

            {!user && (
              <li>
                <NavLink to="login"> Login</NavLink>
              </li>
            )}
            {!user && (
              <li>
                <NavLink to="signup"> Signup</NavLink>
              </li>
            )}
          </ul>
          {user && (
            <Form action="/logout" method="post">
              <button className={styles.logoutButton}>
                Logout{" "}
                <img
                  src={logoutSvg}
                  alt="Logout SVG"
                  className={styles.logoutSvg}
                />
              </button>
            </Form>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
export default RootLayout;
