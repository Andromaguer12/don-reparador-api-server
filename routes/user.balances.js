const { default: axios } = require("axios");
const e = require("express");
const express = require("express");
const { getDateFromTimestamp, validateRequestToken, encryptationFunctions, RANDOMID } = require("../utils/utilsFunctions");
const { isUuid, uuid } = require('uuidv4');
const router = express.Router();

const BalanceModel = require('../services/MongoDB/schemas/userBalances');
const { userDataRef } = require("../services/Firebase/Firebase.firestore");

router.get('/:id', async (req, res) => {
    const { token, key } = req.body;
    const owner = req.params.id;

    if (validateRequestToken(token)) {
        const query = await BalanceModel.findOne({ owner })
        if (query) {
            if (isUuid(key)) {
                userDataRef.doc(owner).get().then((doc) => {
                    if (doc.data()?.uuidKey === key) {
                        try {
                            const decrypted = JSON.parse(encryptationFunctions(
                                query.encrypted,
                                key,
                                "decrypt"
                            ));
                            res.json({
                                status: `requested-balance-for-${owner}`,
                                data: decrypted[0],
                                details: {
                                    tokenValidation: `token-approved-${owner}`,
                                    timestamp: `${getDateFromTimestamp(new Date().getTime()).date}|${getDateFromTimestamp(new Date().getTime()).hour}`
                                },
                                error: null
                            })
                        } catch (error) {
                            res.json({
                                status: `invalid decryptation key`,
                                error: 'the key provided from client cannot decrypt data for this request'
                            })
                        }
                    }
                    else {
                        res.json({
                            status: `invalid decryptation key`,
                            error: 'the key provided from client do not match with this user'
                        })
                    }
                })
            }
            else {
                res.json({
                    status: `invalid decryptation key`,
                    error: 'the key provided from user was not valid for this request'
                })
            }
        }
        else {
            res.json({
                status: `user-balance-error`,
                error: 'this user balance doesnt exist'
            })
        }
    }
    else {
        res.json({
            status: `invalid`,
            error: 'the token provided was not valid for this request'
        })
    }
})

router.post('/taking-order/:id', async (req, res) => {
    const { token, key } = req.body;
    const owner = req.params.id;

    if (validateRequestToken(token)) {
        const query = await BalanceModel.findOne({ owner })
        if (query) {
            if (isUuid(key)) {
                try {
                    const balanceDecrypted = JSON.parse(encryptationFunctions(
                        query.encrypted,
                        key,
                        "decrypt"
                    ))

                    if (balanceDecrypted[0].current_balance - 5 < 0) {
                        res.json({
                            status: `insufficient-funds`,
                            error: 'the current user balance is insufficient for perform this request'
                        })
                    }
                    else {
                        // new balance after take order

                        let thisUserBalance = {
                            ...balanceDecrypted[0],
                            lastModification: new Date().getTime(),
                            current_balance: (balanceDecrypted[0].current_balance - 5)
                        }

                        let encryptedNewBalance = encryptationFunctions(
                            JSON.stringify([thisUserBalance]),
                            key,
                            "encrypt"
                        )

                        await BalanceModel.findOneAndUpdate({ owner }, { encrypted: encryptedNewBalance }).then((object) => {
                            let token = `${uuid()}:${new Date().getTime()}`
                            axios.post(
                                process.env.CURRENT_DOMAIN + '/api/request-balances/verify-user-balance-created/' + owner,
                                {
                                    token,
                                    key
                                }
                            ).then((xres) => {
                                const { data } = xres.data
                                res.json({
                                    status: `updated-balance-for-${owner}-removed-5PEN`,
                                    data,
                                    details: {
                                        tokenValidation: `token-approved-${owner}`,
                                        timestamp: `${getDateFromTimestamp(new Date().getTime()).date}|${getDateFromTimestamp(new Date().getTime()).hour}`
                                    },
                                    error: null
                                })
                            }).catch((error) => {
                                res.json({
                                    status: `There was an error getting again the balance`,
                                    error
                                })
                            })
                        }).catch((error) => {
                            res.json({
                                status: `There was an error`,
                                error
                            })
                        })
                    }
                } catch (error) {
                    res.json({
                        status: `invalid decryptation key`,
                        error: 'the key provided from client cannot decrypt data for this request'
                    })
                }
            }
            else {
                res.json({
                    status: `invalid decryptation key`,
                    error: 'the key provided from user was not valid for this request'
                })
            }
        }
    }
    else {
        res.json({
            status: `invalid`,
            error: 'the token provided was not valid for this request'
        })
    }
})

router.post('/change-specific-amount/:id', async (req, res) => {
    const { token, key, changeAmount } = req.body;
    const owner = req.params.id;

    if (validateRequestToken(token)) {
        const query = await BalanceModel.findOne({ owner })
        if (query) {
            if (isUuid(key)) {
                try {
                    let thisUserBalance = {
                        lastModification: new Date().getTime(),
                        current_balance: changeAmount,
                        owner
                    }

                    let encryptedNewBalance = encryptationFunctions(
                        JSON.stringify([thisUserBalance]),
                        key,
                        "encrypt"
                    )

                    await BalanceModel.findOneAndUpdate({ owner }, { encrypted: encryptedNewBalance }).then(() => {
                        let token = `${uuid()}:${new Date().getTime()}`
                        axios.post(
                            process.env.CURRENT_DOMAIN + '/api/request-balances/verify-user-balance-created/' + owner,
                            {
                                token,
                                key
                            }
                        ).then((xres) => {
                            const { data } = xres.data
                            res.json({
                                status: `updated-balance-for-${owner}-to-${changeAmount}`,
                                data,
                                details: {
                                    tokenValidation: `token-approved-${owner}`,
                                    timestamp: `${getDateFromTimestamp(new Date().getTime()).date}|${getDateFromTimestamp(new Date().getTime()).hour}`
                                },
                                error: null
                            })
                        }).catch((error) => {
                            res.json({
                                status: `There was an error getting again the balance`,
                                error
                            })
                        })
                    }).catch((error) => {
                        res.json({
                            status: `There was an error`,
                            error
                        })
                    })

                } catch (error) {
                    res.json({
                        status: `invalid decryptation key`,
                        error: 'the key provided from user is incorrect for this request'
                    })
                }
            }
            else {
                res.json({
                    status: `invalid decryptation key`,
                    error: 'the key provided from user was not valid for this request'
                })
            }
        }
    }
    else {
        res.json({
            status: `invalid`,
            error: 'the token provided was not valid for this request'
        })
    }
})


router.post('/verify-user-balance-created/:id', async (req, res) => {
    const { token, key } = req.body;
    const owner = req.params.id;

    if (validateRequestToken(token)) {
        const query = await BalanceModel.findOne({ owner })
        if (query) {
            if (isUuid(key)) {
                userDataRef.doc(owner).get().then((doc) => {
                    if (doc.data()?.uuidKey === key) {
                        try {
                            const decrypted = JSON.parse(encryptationFunctions(
                                query.encrypted,
                                key,
                                "decrypt"
                            ))
                            res.json({
                                status: `requested-balance-for-${owner}`,
                                data: decrypted[0],
                                details: {
                                    tokenValidation: `token-approved-${owner}`,
                                    timestamp: `${getDateFromTimestamp(new Date().getTime()).date}|${getDateFromTimestamp(new Date().getTime()).hour}`
                                },
                                error: null
                            })
                        } catch (error) {
                            res.json({
                                status: `invalid decryptation key`,
                                error: 'the key provided from client cannot decrypt data for this request'
                            })
                        }
                    }
                    else {
                        res.json({
                            status: `invalid decryptation key`,
                            error: 'the key provided from client do not match with this user'
                        })
                    }
                })
            }
            else {
                res.json({
                    status: `invalid decryptation key`,
                    error: 'the key provided from user was not valid for this request'
                })
            }
        }
        else {
            const uuidKey = uuid();
            await userDataRef.doc(owner).update({ uuidKey }).then(async () => {
                let thisUserBalance = {
                    owner,
                    lastModification: new Date().getTime(),
                    current_balance: 0,
                }

                let encryptedNewBalance = encryptationFunctions(
                    JSON.stringify([thisUserBalance]),
                    uuidKey,
                    "encrypt"
                )
                let creating = new BalanceModel({
                    owner,
                    encrypted: encryptedNewBalance,
                    key: RANDOMID("54AS68DAS8D67AGAJDKALW;DA", 40)
                })
                await creating.save()
                res.json({
                    status: `created-user-balance-object-for-${owner}`,
                    data: 'successfully created user balance to -> ' + owner,
                    subject: "do-not-update",
                    details: {
                        tokenValidation: `token-approved-${owner}`,
                        timestamp: `${getDateFromTimestamp(new Date().getTime()).date}|${getDateFromTimestamp(new Date().getTime()).hour}`
                    },
                    error: null
                })
            }).catch((error) => {
                res.json({
                    status: `There was an error`,
                    error
                })
            })
        }
    }
    else {
        res.json({
            status: `invalid`,
            error: 'the token provided was not valid for this request'
        })
    }
})


router.delete('/delete-balance/:id', async (req, res) => {
    // const { token, key } = req.body;
    // const owner = req.params.id;

    // await BalanceModel.findOneAndDelete({ owner }).exec().then(() => {
    //     res.json({
    //         status: "deleted -> " + owner,
    //         error: null
    //     })
    // })
})

module.exports = router;
