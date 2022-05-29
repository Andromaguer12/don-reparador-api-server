// graphql resolvers 

const { default: axios } = require("axios")

const BalanceModel = require('../../services/MongoDB/schemas/userBalances')

const resolvers = {
    Query: {
        userBalance: async () => {
            const query = BalanceModel.find();
            if(query) return query
        }
    },
    Mutation: {
        createUserBalance: async (_, args) => {
            const {owner, encrypted, key} = args
            const createBalance = new BalanceModel({owner, encrypted, key})
            await createBalance.save()
            console.log(createBalance)
            return createBalance
        }
    }
}

module.exports = resolvers