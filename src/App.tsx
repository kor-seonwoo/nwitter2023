import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./components/layout"
import Home from "./routes/home"
import Profile from "./routes/profile"
import Login from "./routes/login"
import CreateAccount from "./routes/create-account"
import styled, { createGlobalStyle } from "styled-components"
import reset from "styled-reset"
import { useEffect, useState } from "react"
import LoadingScreen from "./components/loading-screen"
import { auth } from "./firebase"
import ProtectedRoute from "./components/protected-route"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "profile/:uid",
        element: <Profile />,
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/create-account",
    element: <CreateAccount />
  }
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  *{
    box-sizing: border-box;
    margin: 0; padding: 0;
  }
  body{
    font-family: "Pretendard";
    font-size: 16px;
    color: #1D1D1F;
    word-break: keep-all;
  }
  a{
    text-decoration: none;
  }
  @font-face {
    font-family: "Pretendard";
    font-weight: 600;
    src: url("/public/fonts/Pretendard-Bold.otf") format("otf"),
    url("/public/fonts/Pretendard-Bold.ttf") format("ttf"),
    url("/public/fonts/Pretendard-Bold.woff") format("woff"),
    url("/public/fonts/Pretendard-Bold.woff2") format("woff2");
  }
  @font-face {
    font-family: "Pretendard";
    font-weight: 500;
    src: url("/public/fonts/Pretendard-Medium.otf") format("otf"),
    url("/public/fonts/Pretendard-Medium.ttf") format("ttf"),
    url("/public/fonts/Pretendard-Medium.woff") format("woff"),
    url("/public/fonts/Pretendard-Medium.woff2") format("woff2");
  }
  @font-face {
    font-family: "Pretendard";
    font-weight: 400;
    src: url("/public/fonts/Pretendard-Regular.otf") format("otf"),
    url("/public/fonts/Pretendard-Regular.ttf") format("ttf"),
    url("/public/fonts/Pretendard-Regular.woff") format("woff"),
    url("/public/fonts/Pretendard-Regular.woff2") format("woff2");
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  overflow: hidden;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  )
}

export default App
