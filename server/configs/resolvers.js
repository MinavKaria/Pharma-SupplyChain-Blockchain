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
        user: async (_, { walletAddress }) => {
            console.log("Fetching user with wallet address:", walletAddress);
            try {
                const user = await User.findOne({ walletAddress });
                console.log(user)
                if (!user) {
                    return false;
                }
                return true;
                
            } catch (error) {
                throw new Error('Failed to fetch user');
            }
        },
        userAssigned: async () => {
            try {
                const users = await User.find({ assigned: true });
                return users;
            } catch (error) {
                throw new Error('Failed to fetch assigned users');
            }
        }
    },
    Mutation: {
        user: async (_, { name, walletAddress, email, companyName, role, ipfsHash }) => {
            try {

                const userExists = await User.findOne({ walletAddress });
                if (userExists) {
                    console.log("User already exists:", userExists);
                    throw new Error("User already exists");
                }

                console.log("User doesn't exist, creating new user...");
                
                const newUser = new User({
                    name,
                    walletAddress,
                    email,
                    companyName,
                    role,
                    ipfsHash,
                    createdAt: new Date().toISOString(),
                    assigned: false
                });
                const savedUser = await newUser.save();
                console.log("User created successfully:", savedUser);
                return savedUser;
            } catch (error) {
                console.log("Error creating user:", error);
                throw new Error(error.message);
            }
        },
        assignUser: async (_, { walletAddress }) => {
            try {
                const user = await User.findOne({walletAddress});
                if (!user) {
                    throw new Error('User not found');
                }
                user.assigned = true;
                await user.save();
                return user;
            } catch (error) {
                throw new Error('Failed to assign user');
            }
        }
    },
};

export default resolvers;