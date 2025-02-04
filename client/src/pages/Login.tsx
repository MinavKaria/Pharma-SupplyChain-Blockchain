// import React, { useState } from "react";
// import { auth, googleProvider } from "../configs/firebase";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth } from "firebase/auth";
// import { Button } from "@/components/ui/button"
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isSignUp, setIsSignUp] = useState(true);
//   const [isLoading, setIsLoading] = useState(false)
//   const navigate = useNavigate();


//   const handleSignUp = async () => {
//     setIsLoading(true)
//     const auth = getAuth();
//     await createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         console.log(user)
//         navigate("/")
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         setError(errorMessage)
//       }).finally(() => {
//         setIsLoading(false)
       
//       });
//   }

//   const handleLogin = async () => {
//     setIsLoading(true)
//     await signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         console.log(user)
//         setIsLoading(false)
//         navigate("/")
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         setError(errorMessage)
//         setIsLoading(false)
//       }).finally(() => {
//         setIsLoading(false)
        
//       });
//   }



//   const handleEmailPasswordLogin=(e)=>{
//     e.preventDefault()
//     if(isSignUp){
//       handleSignUp()
//     }else{
//       handleLogin()
//     }
//   }

//   const handleGoogleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       const user = result.user;
//       console.log(user);
//       navigate("/");
//     } catch (error: any) {
//       setError(error.message);
//     }
//   };

//   return (
    
//     <>
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
//         <h3 className="text-2xl font-bold text-center">Login to your account</h3>
//         <form onSubmit={handleEmailPasswordLogin} className="mt-4">
//           <div className="mt-4">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="mail@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mt-4">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="Your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mt-4 flex flex-wrap justify-between">
//             {error && <div className="text-red-500">{error}</div>}
//           </div>
//           <div className="flex flex-col gap-4 mt-6">
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? (
//                 <h1>Loading</h1>
//               ):(
//                 <>
//                 {isSignUp ? "Sign Up" : "Login"}
//                 </>
//               )}
              
//             </Button>
          
//             <Button type="button" variant="outline" onClick={handleGoogleLogin}>
//               <img src="/google-icon.webp" alt="" className="mr-2 h-4 w-4"/>
//               Sign In with Google
//             </Button>
//             <div className="text-center w-full">
//               <Button
//                 type="button"
//                 variant="link"
//                 onClick={() => setIsSignUp(!isSignUp)}
//                 className=" text-right"
//               >
//                 {isSignUp ? "Already have an account? Login" : "Create an account"}
//               </Button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//     </>
//   );
// };

// export default Login;
