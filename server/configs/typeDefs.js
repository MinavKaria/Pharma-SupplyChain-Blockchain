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
    assigned: Boolean!
}

type Query {
    users: [User],
    user(walletAddress: String!): Boolean,
    userAssigned: [User]
}

type Mutation {
    user(name: String!, walletAddress: String!, email: String!, companyName: String!, role: String!, ipfsHash: String!): User
    assignUser(walletAddress: String!): User
}
`;

export default typeDefs;