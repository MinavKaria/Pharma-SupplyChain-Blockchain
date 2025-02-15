import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './configs/router'
import ContextProvider from './provider/Context'
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {

  useRegisterSW({
    onNeedRefresh() {
      if (confirm('New update available. Reload?')) {
        location.reload(); 
      }
    },
    onOfflineReady() {
      console.log('App is ready to work offline.');
    },
  });

  return (
    <>
      <ContextProvider>
        <RouterProvider router={router}/>
      </ContextProvider>
    </>
  )
}

export default App
