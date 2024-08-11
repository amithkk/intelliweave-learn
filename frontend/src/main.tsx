import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@mantine/carousel/styles.css';
import  '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import '@dotlottie/react-player/dist/index.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {LessonsList} from "./components/LessonsList/LessonsList.tsx";
import {LessonComposer} from "./components/Composer/LessonComposer.tsx";

const router = createBrowserRouter([
    {
        path: "/",

        element: <App/>,
        children: [
            {
                path: "lessons",
                element: <LessonsList/>

            },
            {
                path: "lessons/:lid/composer",
                element: <LessonComposer/>
            }

        ]
    },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>,
)
