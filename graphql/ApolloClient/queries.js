const gql = require("apollo-server-express")

const USER_BALANCE_QUERY = gql`
    query ($owner: String) {
        userBalance(owner: $owner){
            encrypted
            id
        }
    }
`