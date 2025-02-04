// import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { useEffect, useState } from "react";
// import { auth } from "../../configs/firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const [user, setUser] = useState<any>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser); 
//       } else {
//         setUser(null); 
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//   };

//   return (
//     <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 backdrop-blur-lg bg-white dark:bg-gray-950 shadow-md dark:shadow-none">

//       <Sheet>
//         <SheetTrigger asChild>
//           <Button variant="outline" size="icon" className="lg:hidden">
//             <MenuIcon className="h-6 w-6" />
//             <span className="sr-only">Toggle navigation menu</span>
//           </Button>
//         </SheetTrigger>

//         <SheetContent side="left">
//           <div className="mr-6 hidden lg:flex" onClick={()=>{
//             navigate("/");
//           }} >
//             <MountainIcon className="h-6 w-6" />
//             <span className="sr-only">My App</span>
//           </div>
//           <div className=" gap-2 py-6 flex">
//             <a href="#" className="flex w-full items-center py-2 text-lg font-semibold" >
//               Home
//             </a>
//             <a href="#" className="flex w-full items-center py-2 text-lg font-semibold" >
//               About
//             </a>
//             <a href="#" className="flex w-full items-center py-2 text-lg font-semibold" >
//               Services
//             </a>
//             <a href="#" className="flex w-full items-center py-2 text-lg font-semibold" >
//               Contact
//             </a>
//           </div>
//         </SheetContent>
//       </Sheet>

//       <a href="#" className="mr-6 hidden lg:flex" onClick={()=>{navigate("/")}}>
//         <MountainIcon className="h-6 w-6" />
//         <span className="px-2 font-bold">My App</span>
//       </a>

//       <nav className="ml-auto hidden lg:flex gap-6 items-center">
        
//         <a href="#" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-white dark:hover:text-gray-50">
//           Home
//         </a>
//         <a href="#" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-white dark:hover:text-gray-50">
//           About
//         </a>
//         <a href="#" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-white dark:hover:text-gray-50">
//           Services
//         </a>
//         <a href="#" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-white dark:hover:text-gray-50">
//           Contact
//         </a>
//         {user ? (
//           <>
//             {/* <div>
//               <h3 className="font-medium">Welcome, {user.displayName || user.email}</h3>
//               <button onClick={handleLogout} className="ml-4 text-sm text-red-600 hover:underline">
//                 Logout
//               </button>
//             </div> */}
//             <div className="rounded-full overflow-hidden w-10 h-10 flex items-center justify-center bg-gray-200 cursor-pointer" onClick={() => navigate("/profile")}>
//               <div>
//                  {user.email.charAt(0).toUpperCase()}
//               </div>
//             </div>
//             <Button onClick={handleLogout} className="font-medium text-sm transition-colors hover:underline" variant="destructive">
//               Logout
//             </Button>
//           </>
//         ) : (
//           <Button className="font-medium text-sm transition-colors hover:underline" onClick={()=>{
//             navigate("/login");
//           }}>
//             Login
//           </Button>
//         )}
//       </nav>
//     </header>
//   );
// }


// function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <line x1="4" x2="20" y1="12" y2="12" />
//       <line x1="4" x2="20" y1="6" y2="6" />
//       <line x1="4" x2="20" y1="18" y2="18" />
//     </svg>
//   );
// }


// function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
//     </svg>
//   );
// }
