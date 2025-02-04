// import { useEffect, useState } from "react";
// import { auth } from "../configs/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useNavigate } from "react-router-dom";
// import { Mail, User, Key, LogOut, Camera } from "lucide-react";

// const Profile = () => {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         console.log(currentUser);
//       } else {
//         navigate('/login');
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="space-y-4">
//           <Skeleton className="w-24 h-24 rounded-full mx-auto" />
//           <Skeleton className="h-8 w-48" />
//           <Skeleton className="h-32 w-[300px]" />
//         </div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-2xl mx-auto px-4">
//         <Card className="shadow-xl">
//           <CardHeader className="text-center pb-2">
//             <div className="relative w-24 h-24 mx-auto mb-4">
//               {user.photoURL ? (
//                 <img
//                   src={user.photoURL}
//                   alt="Profile"
//                   className="rounded-full w-full h-full object-cover border-4 border-white shadow-lg"
//                 />
//               ) : (
//                 <div className="rounded-full w-full h-full bg-blue-100 flex items-center justify-center">
//                   <User className="w-12 h-12 text-blue-500" />
//                 </div>
//               )}
//               <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
//                 <Camera className="w-4 h-4 text-gray-600" />
//               </button>
//             </div>
//             <CardTitle className="text-3xl font-bold text-gray-800">
//               {user.displayName || "Welcome!"}
//             </CardTitle>
//             <p className="text-gray-500 mt-1">Member since {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
//           </CardHeader>
//           <CardContent className="space-y-6 pt-6">
//             <div className="space-y-4">
//               <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//                 <Mail className="w-5 h-5 text-blue-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">Email</p>
//                   <p className="font-medium">{user.email}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//                 <Key className="w-5 h-5 text-blue-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">User ID</p>
//                   <p className="font-medium">{user.uid}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-center pt-4">
//               <Button
//                 variant="destructive"
//                 onClick={async () => {
//                   await auth.signOut();
//                   navigate("/login");
//                 }}
//                 className="w-full sm:w-auto"
//               >
//                 <LogOut className="w-4 h-4 mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Profile;