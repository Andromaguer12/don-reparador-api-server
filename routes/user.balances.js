const { default: axios } = require("axios");
const e = require("express");
const express = require("express")

const router = express.Router();

router.get('/:id', async (req, res) => {
    const {token} = req.params.id;
    if(token){
        axios.get(process.env.CURRENT_DOMAIN+"/apollo")
    }
})