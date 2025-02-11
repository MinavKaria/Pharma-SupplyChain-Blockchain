import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './configs/typeDefs.js';
import resolvers from './configs/resolvers.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


async function startServer()
{
    const app=express();
    const server=new ApolloServer({
        typeDefs,
        resolvers
    });

    await server.start();
    
    dotenv.config();
    app.use(cors());
    app.use(bodyParser.json());

    try{
        console.log('Connecting to MongoDB');

        
        mongoose.connect(process.env.MONGO_URI)
    
        console.log('Connected to MongoDB');
    }
    catch(error){
        console.log('Failed to connect to MongoDB');
    }
    
  

    app.use('/graphql', expressMiddleware(server));

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
}

startServer();