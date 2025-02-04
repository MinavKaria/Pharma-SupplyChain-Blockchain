import { createBrowserRouter } from "react-router-dom";
import Layout from "../pages/Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Profile from "@/pages/Profile";
import RoleApplicationForm from "@/pages/ApplyForRole";


const router=createBrowserRouter([
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                path:'/',
                element:<Landing/>
            },
            {
                path:'/profile',
                element:(
                    <>
                        <Profile/>
                    </>
                )
            },
            {
                path:'/apply',
                element:(
                    <>
                        <RoleApplicationForm/>
                    </>
                )
            }
        ]
    },
    {
        path:"/signup",
        element:(
            <>
                <h1>Signup Page</h1>
            </>
        )
    },
    {
        path:"/login",
        element:(
            <>
                <Login/>
            </>
        )
    },
    {
        path:"*",
        element:(
            <>
                <h1>404 Page not found</h1>
            </>
        )
    }
])

export default router;