import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './configs/router'
import ContextProvider from './provider/Context'

function App() {

  return (
    <>
      <ContextProvider>
        <RouterProvider router={router}/>
      </ContextProvider>
    </>
  )
}

export default App
