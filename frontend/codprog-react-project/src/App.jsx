import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import { About, Home, Login, MyCourses, Signup, Profile } from "./pages";
import { loginAction, loginLoader } from "./pages/Login";
import { myCourseLoader } from "./pages/MyCourses";
import { profileLoader } from "./pages/Profile";
import { signupAction, signupLoader } from "./pages/Signup";
import { logoutAction } from "./pages/Logout";
import { getUser } from "./utils/getUser";
import { homeLoader } from "./pages/Home";
import CourseDetail, { courseDetailLoader } from "./pages/CourseDetail";
import Payment, { paymentLoader } from "./pages/Payment";
import Thankyou from "./pages/Thankyou";
import MyCourseVideos, { myCourseVideosLoader } from "./pages/MyCourseVideos";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} loader={getUser} id="parentRoute">
      <Route index element={<Home />} loader={homeLoader} />
      <Route path="about" element={<About />} />
      <Route path="profile" element={<Profile />} loader={profileLoader} />

      <Route
        path="login"
        element={<Login />}
        action={loginAction}
        loader={loginLoader}
      />
      <Route
        path="signup"
        element={<Signup />}
        action={signupAction}
        loader={signupLoader}
      />
      <Route path="logout" action={logoutAction} />
      <Route
        path="my-courses"
        element={<MyCourses />}
        loader={myCourseLoader}
      />
      <Route
        path="/course-detail/:id"
        element={<CourseDetail />}
        loader={courseDetailLoader}
      />
      <Route
        path="/payment/:courseID"
        element={<Payment />}
        loader={paymentLoader}
      />
      <Route
        path="/my-courses/:courseID"
        element={<MyCourseVideos />}
        loader={myCourseVideosLoader}
      />
      <Route path="thankyou" element={<Thankyou />} />
    </Route>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
export default App;
