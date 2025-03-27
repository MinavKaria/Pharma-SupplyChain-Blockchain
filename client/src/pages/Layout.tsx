import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Navbar2 from "./../components/Navbar/Navbar2";
import { Toaster } from "@/components/ui/toaster";

function Layout() {
  return (
    <>
      {/* <Navbar/> */}
      <div className="flex flex-col min-h-screen">
        <Navbar2 />
        <div className="flex-grow w-full">
          <div className="container mx-auto">
            <Outlet />
            <Toaster />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Layout;
