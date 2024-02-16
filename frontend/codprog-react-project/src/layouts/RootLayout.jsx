import { NavLink, Outlet, Form, useRouteLoaderData } from "react-router-dom";

function RootLayout() {
  const user = useRouteLoaderData("parentRoute");
  return (
    <>
      <header>
        <nav>
          <h1 className="logo">
            <NavLink to="/">Codprog </NavLink>
          </h1>
          <ul>
            <li>
              <NavLink to="about"> About</NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="profile"> Profile</NavLink>
              </li>
            )}

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
              <button>Logout</button>
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
