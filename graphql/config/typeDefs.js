const { gql } = require("apollo-server-express")

const typeDefs = gql`
    type UserBalances {
        id: ID
        owner: String
        encrypted: String
        key: String
    }

    type Query {
        userBalance: UserBalances
    }

    type Mutation {
        createUserBalance(
            owner: String!
            encrypted: String!
            key: String!
        ): UserBalances
    }
`

module.exports = {typeDefs}