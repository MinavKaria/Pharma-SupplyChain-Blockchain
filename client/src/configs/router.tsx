import { createBrowserRouter } from "react-router-dom";
import Layout from "../pages/Layout";
import Landing from "../pages/Landing";
// import Profile from "@/pages/Profile";
import RoleApplicationForm from "@/pages/ApplyForRole";
import Navigation from "@/pages/Navigation";
import AssignRole from "@/pages/AssignRole";
import TransferBatches from "@/pages/TransferBatches";
import CheckTransactions from "@/pages/CheckTransactions";
import CheckBatchDetails from "@/pages/CheckBatchDetails";
import CheckAllBatches from "@/pages/CheckAllBatches";
import CreateBatch from "@/pages/CreateBatch";
import VerifyBatch from "@/pages/VerifyBatch";
// import Fake from "@/pages/Fake";
// import Test from "@/pages/Test";
// import Test2 from "@/pages/Test2";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <Landing />
          </>
        ),
      },
      {
        path: "/profile",
        element: (
          <>
            <h1>Profile</h1>
          </>
        ),
      },
      {
        path: "/apply",
        element: (
          <>
            <RoleApplicationForm />
          </>
        ),
      },
      {
        path: "/navigation",
        element: (
          <>
            <Navigation />
          </>
        ),
      },
      {
        path: "/assign",
        element: (
          <>
            <AssignRole />
          </>
        ),
      },
      {
        path: "create-batch",
        element: (
          <>
            <CreateBatch />
          </>
        ),
      },
      {
        path: "/transfer",
        element: (
          <>
            <TransferBatches />
          </>
        ),
      },
      {
        path: "/check-transaction",
        element: (
          <>
            <CheckTransactions />
            {/* <Fake/> */}
          </>
        ),
      },
      {
        path: "/check-batches",
        element: (
          <>
            <CheckBatchDetails />
          </>
        ),
      },
      {
        path: "/check-all-batches",
        element: (
          <>
            <CheckAllBatches />
          </>
        ),
      },
      // {
      //   path: "/test",
      //   element: (
      //     <>
      //       <Test2/>
      //     </>
      //   ),
      // },
      {
        path: "/verify-batch",
        element: (
          <>
            <VerifyBatch />
          </>
        ),
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <>
        <h1>Signup Page</h1>
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <h1>Login</h1>
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <h1>404 Page not found</h1>
      </>
    ),
  },
]);

export default router;
