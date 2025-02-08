// configs/typeDefs.js

const typeDefs=`
type User
{
    id: ID!
    name: String!
    walletAddress: String!
    email: String!
    companyName: String!
    role: String!
    ipfsHash: String!
    createdAt: String!
}

type Query {
    users: [User],
    user(id: ID!): User
}

type Mutation {
    user(name: String!, walletAddress: String!, email: String!, companyName: String!, role: String!, ipfsHash: String!): User
}
`;

export default typeDefs;