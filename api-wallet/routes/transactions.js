const express = require('express');
const routeTransaction = express.Router();//routes
const joi = require('@hapi/joi'); //validator
const config = require("../configDB.js");
const jwt = require('jsonwebtoken');
const userExtractor = require('../middlewares/userExtractor');//import userExtractor for token

//routes------------
//add transaction
routeTransaction.post('/', userExtractor, (req, res) =>{
    
    const {id_user} = req; //recover id_user

    if(!req.body.amount || !req.body.concept || !req.body.type || !req.body.category || !req.body.date){
        res.status(400).json({error: {path: 'genericError', message:"a parameter is missing"}});
    }
    req.getConnection((err, conn) => {
        if(err) return res.send(err);
        conn.query(`use ${config.database}`);
        const {amount, concept, type, category, date} = req.body;
        const newBody = {amount, concept, type, category, date, id_user};
        //add transaction
        conn.query('INSERT INTO transaction set ?',[newBody] ,(err, rows) => {
            const {error} = validateAmount(req.body.amount);//validate amount format
            if(error){
                res.status(400).json({error: error.details[0]});
            }
            if(err) return res.send(err)
            res.json({data: 'the transaction has been added'});
        });
    })
});

//update transaction
routeTransaction.put('/:id',userExtractor, (req, res) =>{
    if(!req.body.amount || !req.body.concept || !req.body.type || !req.body.category || !req.body.date){
        return res.json({error: 'a parameter is missing'});
    }
    req.getConnection((err, conn) => {
        if(err) return res.send(err);
        conn.query(`use ${config.database}`);
        
        const {id_user} = req; //recover id_user

        const {amount, concept, type, category, date} = req.body;
        const newBody = {amount, concept, type, category, date, id_user};
        conn.query(`SELECT id_user FROM transaction WHERE id = ${req.params.id}`, (err, rows) =>{
            if (err) return res.status(500).json({error: err.message})
            if(rows[0].id_user !== id_user){
                return res.status(403).json({error: 'permission to access resource denied, invalid token'});
            }

            //add transaction
            conn.query('UPDATE transaction set ? WHERE id = ?',[newBody, req.params.id] ,(err, rows) => {
                const {error} = validateAmount(req.body.amount);//validate amount format
                if(error){
                    return res.json({error: "enter a valid amount"})
                }
                if(err) return res.json({error: err.message})

                res.json({data: 'the transaction has been updated'});
                
            });

        })
        
        
    })
});

//get all transactions per user
routeTransaction.get('/all',userExtractor, (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return (res.send(err));
        const {id_user} = req;
        conn.query(`use ${config.database}`);
        //get transactions
        conn.query(`SELECT * FROM transaction WHERE id_user = ${id_user}`, (err, rows) => {
            if(err) return res.json({error: err.message});
            let reverse = rows.reverse();
            res.json(reverse);
        })
    });
});

//get all transactions per user limited
routeTransaction.get('/limited',userExtractor, (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.json({error: err.message});
        const {id_user} = req;       
        conn.query(`use ${config.database}`);
        //get transactions
        conn.query(`SELECT * FROM transaction WHERE id_user = ${id_user}`, (err, rows) => {
            if(err) return res.json({error: err.message});
            let reverse = rows.reverse();
            reverse = reverse.splice(0,10);
            res.json(reverse);
        })
    });
});

//get one transaction
routeTransaction.get('/one/:id',userExtractor, (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.json({error: err.message});
        const {id_user} = req;       
        conn.query(`use ${config.database}`);
        //get transactions
        conn.query(`SELECT * FROM transaction WHERE id_user = ${id_user} AND id=${req.params.id}`, (err, rows) => {
            if(err) return res.json({error: err.message});
            res.json(rows[0]);
        })
    });
});

//get transactions for egress
routeTransaction.get('/egress',userExtractor, (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.json({error: err.message});
        const {id_user} = req;       
        conn.query(`use ${config.database}`);
        //get transactions
        conn.query(`SELECT * FROM transaction WHERE id_user = ${id_user} AND type='egress'`, (err, rows) => {
            if(err) return res.json({error: err.message});
            let reverse = rows.reverse();
            res.json(reverse);
        })
    });
});

//get transactions for ingress
routeTransaction.get('/ingress',userExtractor, (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.json({error: err.message});
        const {id_user} = req;       
        conn.query(`use ${config.database}`);
        //get transactions
        conn.query(`SELECT * FROM transaction WHERE id_user = ${id_user} AND type='ingress'`, (err, rows) => {
            if(err) return res.json({error: err.message});
            let reverse = rows.reverse();
            res.json(reverse);
        })
    });
});

//Delete transaction
routeTransaction.delete('/:id',userExtractor, (req, res) =>{
    req.getConnection((err, conn) => {
        if(err) return res.json({error: err.message});
        const {id_user} = req;       
        conn.query(`use ${config.database}`);

        conn.query(`SELECT id_user FROM transaction WHERE id = ${req.params.id}`, (err, rows) =>{
            if (err) return res.status(500).json({error: err.message})
            if(rows[0].id_user !== id_user){
                return res.status(403).json({error: 'permission to access resource denied, invalid token'});
            }
            //delete transaction
            conn.query('DELETE FROM transaction WHERE id = ?',[req.params.id] ,(err) => {
                if(err) return res.json({error: err.message});
                res.json({data: `the transaction with id= ${req.params.id}has been deleted`});
            });
        })
        
    })
});

const validateAmount = (amt) =>{
    const schema = joi.object({
        amount: joi.number()
            .positive()
            .required()
    });
    return (schema.validate({amount: amt}));
}

module.exports = routeTransaction;