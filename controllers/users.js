const { request, response } = require('express');
const bcrypt = require('bcrypt');
const usersModel = require('../models/users')
const pool = require('../db');

// Endpoint to list users
//USE  GET
const listUsers = async (req = request, res = response) => {
    let conn;

    try {
        conn = await pool.getConnection();

        const users = await conn.query(usersModel.getAll, (err) => {
            if (err) {
                throw err
            }
        });

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

// Endpoint to get a user by ID
//USE  GET
const listUserByID = async (req = request, res = response) => {
    const { id } = req.params;

    if (isNaN(id)) {
        res.status(404).json({ msg: 'Invalid ID' });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        const [user] = await conn.query(usersModel.getByID, [id], (err) => {
            if (err) {
                throw err
            }
        });

        if (!user) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

// Endpoint to add a user
//USE PUT
const addUser = async (req = request, res = response) => {

    //const {id} = req.params;
    const {
        username, 
        email, 
        password, 
        name, 
        lastname,
        phone_number = '',
        role_id,
        is_active = 1
    } =req.body; 
   

    if (!username || !email || !password || !name || !lastname || !role_id) {
        res.status(400).json({ msg: 'Missing information' });
        return;
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = [
        username,
         email,
          passwordHash, 
          name, 
          lastname, 
          phone_number, 
          role_id, 
          is_active];

    let conn;

    try {
        conn = await pool.getConnection();

        const [usernameUser] = await conn.query(
            usersModel.getByUsername,
            [username],
            (err) => { if (err) throw err; }
        );
        const passwordHash = await bcrypt.hash(password, saltRounds);

        if (usernameUser) {
            res.status(409).json({ msg: `User with username ${username} already exists` });
            return;
        }

        const [emailUser] = await conn.query(
            usersModel.getByEmail,
            [email],
            (err) => { if (err) throw err; }
        );

        const userAdded = await conn.query(usersModel.addRow, [...user], (err) => {
            if (err) throw err;
        });

        if (userAdded.affectedRows === 0) {
            throw new Error({ message: 'Failed to add user' });
        }
        res.json({ msg: 'User added successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

//Endpoind to update a user
// USE DELETE
const deleteUser = async (req = request, res = response) => {
    let conn;
    const { id } = req.params;

    try {
        conn = await pool.getConnection();

        const [userExists] = await conn.query(
            usersModel.getByID,
            [id],
            (err) => { throw err; }
        );

        if (!userExists || userExists.is_active === 0) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }

        const userDelete = await conn.query(
            usersModel.deleteRow,
            [id],
            (err) => { if (err) throw err; }
        );

        if (userDelete.affectedRows === 0) {
            throw new Error({ msg: 'Failed to delete user' });


        }

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

//######### UPDATE ###############
// Endpoint to update a user
// USE PATCH
//
/*
const updateUser = async (req = request, res = response)=>{
   
        const {id} = req.params;
        const {
            username, 
            email, 
            password, 
            name, 
            lastname,
            phone_number = '',
            role_id,
            is_active = 1
        } =req.body; 
    //----------------------------
      
        if (!username || !email || !password || !name || !lastname || !role_id){
            res.status(400).json({msg: "Missing information"});
            return;
        }
 
         let conn;
    
         try {
            conn = await pool.getConnection();//Conexion a la bd
    
            // Realiza una consulta para obtener el usuario existente con el ID especificado
            const [existingUser] = await conn.query(
                usersModel.getByID, //updatByID
                [id],
                (err) => { if (err) throw err;});
            // Verifica si el usuario existe en la base de datos y responde con un error 404 si no se encuentra
            if (!existingUser) {
                res.status(404).json({ msg: `User with id ${id} not found` });
                return;
            }
    
            const [usernameUser] = await conn.query(
                usersModel.getByUsername,
                [username],
                (err)=>{if(err)throw err;}
            );
            if (usernameUser){
                res.status(409).json({msg: `User with username ${username} already exists`});
                return;
            }
  
            const [emailUser] = await conn.query(
                usersModel.getByEmail,
                [email],
                (err)=>{if(err)throw err;}
            );
            if (emailUser){
                res.status(409).json({msg: `User with username ${email} already exists`});
                return;
            }
    

            const updateResult = await conn.query(
                usersModel.updateUser,
                [username, email, password, name, lastname, phone_number, role_id, is_active, id]
            );

            // Verifica si la consulta de actualización afectó a alguna fila en la base de datos y responde 
            //con un error 404 si no se realizaron modificaciones
            if (updateResult.affectedRows === 0) {
                res.status(404).json({msg: `Failed to modify user`})
                return;
            }
            res.json({ msg: "User modified successfully" });
            
        } catch (error) {
            console.error(error);
            res.status(500).json(error);
        } finally {
            if (conn) conn.end();// Libera la conexión a la base de datos
        }
}
*/


//endpoint UPDATE V2

const updateUser = async (req = request, res = response)=>{
    let conn;

    const {id} = req.params;

    const {
        username, 
        email, 
        password, 
        name, 
        lastname,
        phone_number ,
        role_id,
        is_active 
    } =req.body; 

    //recibe los datos enviados  por postman o etc
    let user =[
        username, 
        email, 
        password, 
        name, 
        lastname,
        phone_number ,
        role_id,
        is_active 
    ]

    try{
        conn = await pool.getConnection();//Conexion a la bd


        const [userExists] = await conn.query(
            usersModel.getByID,
            [id],
            (err) => { throw err; }
        );

        if (!userExists || userExists.is_active === 0) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        /*
if  (username == userExists.username){
    res.status(409).json({msg: 'Username already exits'});
    return;
}

if  (email == userExists.email){
    res.status(409).json({msg: 'Email already exits'});
    return;
}
*/

const [usernameUser] = await conn.query(
    usersModel.getByUsername,
    [username],
    (err) => { if (err) throw err; }
);

if (usernameUser) {
    res.status(409).json({ msg: `User with username ${username} already exists` });
    return;
}

const [emailUser] = await conn.query(
    usersModel.getByEmail,
    [email],
    (err) => { if (err) throw err; }
);
if (emailUser){
    res.status(409).json({ msg: `User with email ${email} already exists` });
    return;
}
        //contiene la informacion de la  db
        let oldUser = [
        userExists.username, 
        userExists.email, 
        userExists.password, 
        userExists.name, 
        userExists.lastname,
        userExists.phone_number ,
        userExists.role_id,
        userExists.is_active 
        ]

        user.forEach((userData,index)=>{
            if(!userData) {
                user[index] = oldUser[index]
            };
           
        }) 
        const userUpdated = conn.query(usersModel.updateRow,[...user, id ],(err) => {
            throw err;
        });
       
        if(userUpdated.affectedRows == 0){
            throw new Error('User not updated');
        }

        res.json({msg:'User updated successfully',...oldUser});
    } catch (err) {
        res.status(409).json(err);
        //console.log(error);
        return;
    } finally {
        if (conn) conn.end();// Libera la conexión a la base de datos
    }
}

module.exports = { listUsers, listUserByID, addUser, deleteUser, updateUser };

