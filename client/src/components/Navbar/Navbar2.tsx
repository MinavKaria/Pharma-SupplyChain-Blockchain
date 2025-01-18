import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function Navbar2() {
    const navigate=useNavigate();
  return (
    <>
        <div>
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                <div>
                <p className="text-xl font-bold text-gray-800 cursor-pointer" onClick={()=>{
                    navigate("/");
                }}>Pharma Supply Chain</p>
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