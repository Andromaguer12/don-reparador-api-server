const { userDataRef } = require("../services/Firebase/Firebase.firestore")

const NOTIFICATIONS_CODES = [
    {
        code: 'disable-0001',
        function: (params) => new Promise((response, reject) => {
            setTimeout(() => {
                userDataRef
                .doc(params.email)
                .collection('UserNotifications')
                .doc(params.notid)
                .update({ viewed: true })
                .then((doc) => {
                    response({
                        status: "notification disabled with delay 20000",
                        error: null
                    })
                }).catch((error) => {
                    reject({
                        status: 'error: '+error.message,
                        error: error 
                    })
                })
            }, 20000);
        })
    }
]

module.exports = {
    NOTIFICATIONS_CODES
}