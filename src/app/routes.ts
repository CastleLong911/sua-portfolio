import { createBrowserRouter } from "react-router";
import Root from "./components/Root.tsx";
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Upload from "./components/Upload.tsx";
import ArtworkDetail from "./components/ArtworkDetail.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "upload", Component: Upload },
      { path: "artwork/:id", Component: ArtworkDetail },
    ],
  },
]);
