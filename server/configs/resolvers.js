import User from '../schema/User.js';

const resolvers = {
    Query: {
        users: async () => {
            try {
                const users = await User.find();
                return users;
            } catch (error) {
                throw new Error('Failed to fetch users');
            }
        },
        user: async (_, { id }) => {
            try {
                const user = await User.findById(id);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            } catch (error) {
                throw new Error('Failed to fetch user');
            }
        }
    },
    Mutation: {
        user: async (_, { name, walletAddress, email, companyName, role, ipfsHash }) => {
            try {
                const newUser = new User({
                    name,
                    walletAddress,
                    email,
                    companyName,
                    role,
                    ipfsHash
                });
                const savedUser = await newUser.save();
                return savedUser;
            } catch (error) {
                throw new Error('Failed to create user');
            }
        }
    }
};

export default resolvers;