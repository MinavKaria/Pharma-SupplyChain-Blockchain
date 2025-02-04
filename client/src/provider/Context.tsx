import { useState, createContext, useContext, ReactNode } from 'react';

interface ContextProps {
    sample: number;
    setSample: (value: number) => void;
}

const Context = createContext<ContextProps | undefined>(undefined);

interface ContextProviderProps {
    children: ReactNode;
}

function ContextProvider({ children }: ContextProviderProps) {
   
    const [sample, setSample] = useState<number>(0);

    return (
        <Context.Provider value={{sample,setSample}}>
            {children}
        </Context.Provider>
    );
}

export default ContextProvider;

export const useGlobalContext = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useGlobalContext must be used within a Context.Provider');
    }
    return context;
};