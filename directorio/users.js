const {request, response} = require('express');
const conn = require('../db');

const listusers = (req = request, res = response) =>{
    try{
        conn.query('SELECT * FROM users', (err,result) => {
            if (err){
                throw err
            }
            res.json(result);
        });
    
    } catch (error){
        res.status(500).json(error);
    } finally{
        conn.end();
    }
    
}

module.exports = {listusers};