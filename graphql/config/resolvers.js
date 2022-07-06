// // graphql resolvers 

// const { default: axios } = require("axios")

// const BalanceModel = require('../../services/MongoDB/schemas/userBalances')

// const resolvers = {
//     Query: {
//         userBalance: async (_, args) => {
//             const {owner} = args;
//             console.log("Finding one -> ", owner)
//             const query = await BalanceModel.findOne({owner}).exec();
//             if(query) return query
//         },
//         allUserBalances: async () => {
//             const query = await BalanceModel.find().exec();
//             if(query) return query
//         }
//     },
//     Mutation: {
//         createUserBalance: async (_, args) => {
//             const {owner, encrypted, key} = args.thisBalance;
//             const createBalance = new BalanceModel({owner, encrypted, key})
//             await createBalance.save()
//             console.log(createBalance)
//             return createBalance
//         },
//         updateUserBalance: async (_, args) => {
//             const {owner, encrypted} = args.thisBalance;
//             let filter = {owner}
//             let update = {encrypted}
//             let updateBalance = await BalanceModel.findOneAndUpdate(filter, update, {new: true}).exec();
//             console.log("updating to -> ", owner)
//             return updateBalance
//         }
//     }
// }

// module.exports = resolvers