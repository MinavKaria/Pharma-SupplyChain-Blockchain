import { createBrowserRouter } from "react-router-dom";
import Layout from "../pages/Layout";
import Landing from "../pages/Landing";
// import Profile from "@/pages/Profile";
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
                        <h1>Profile</h1>
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
                <h1>Login</h1>
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