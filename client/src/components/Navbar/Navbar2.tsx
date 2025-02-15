import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom';
import { CuboidIcon as Cube } from "lucide-react"

function Navbar2() {
    const navigate=useNavigate();
  return (
    <>
        <div>
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                <div>
                <div className="flex justify-center items-center text-xl font-bold text-gray-800 cursor-pointer" onClick={()=>{
                    navigate("/");
                }}><Cube className="h-6 w-6 mr-2" />
                  <span className="font-bold">SuppliChain</span></div>
                </div>
                <div>
                <ConnectButton/>

                </div>
                </div>
        </div>
    </>
  )
}

export default Navbar2