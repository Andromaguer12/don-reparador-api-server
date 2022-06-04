const { gql } = require("apollo-server-express");

const typeDefs = gql`
    # INPUTS 
    input UserBalanceInput { 
        owner: String!
        encrypted: String!
    }

    input UpdateUserBalanceInput {
        owner: String!
        encrypted: String!
    }

    # TYPES 
    type UserBalances {
        id: ID
        owner: String
        encrypted: String
    }

    type Query {
        userBalance(owner: String!): UserBalances!,
        allUserBalances: [UserBalances]!
    }

    type Mutation {
        createUserBalance(thisBalance: UserBalanceInput): UserBalances,
        updateUserBalance(thisBalance: UpdateUserBalanceInput): UserBalances
    }
`;

module.exports = { typeDefs };
