const { request, response } = require('express');
const usersModel = require('../models/users')
const pool = require('../db');

//endpoint
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

//endpoint
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////12/10/2023
/*
{
            username: 'admin',
            email: 'admin@example.com',
            password: '123',
            name: 'Administrador',
            lastname: 'De sitios',
            phone_number: '55555555',
            role_id: '1',
            is_active: '1', 
}
*/

///////////////////////////
const addUser = async (req = request, res = response) => {
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_isactive = 1
    } = req.body;

    if (!username || !email || !password || !name || !lastname || !role_id) {
        res.status(400).json({ msg: 'Missing information' });
        return;
    }

    const user = [username, email, password, name, lastname, phone_number, role_id, id_isactive];

    let conn;

    try {
        conn = await pool.getConnection();
        //***********************************
        const [usernameUser] = await conn.query(
            usersModel.getByUsername,
            [username],
            (err) => { if (err) throw err; }
        );
        if (usernameUser) {
            res.status(409).json({ msg: `User with ${username} already exists` });
            return;
        }
        //****************************
        const [emailUser] = await conn.query(
            usersModel.getByEmail,
            [email],
            (err) => { if (err) throw err; }
        );
        if (emailUser) {
            res.status(409).json({ msg: `User whith ${email} already exists` });
            return;
        }

        const userAdded = await conn.query(usersModel.addRow, [...user], (err) => {
            if (err) throw err;
        });

        if (userAdded.affecteRows === 0) throw new Error({ message: 'Failed to add user' });
        res.json({ msg: 'User added successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}
////////////////////////////////////////////////////////////////////////////////////////////12/10/2023

/*
// Endpoint  para modificar datos
const updateUserPatch = async (req = request, res = response) => {
    const { id } = req.params;
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_isactive
    } = req.body;

    if (isNaN(id)) {
        res.status(400).json({ msg: 'Invalid ID' });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        // Verificar si el usuario que se desea actualizar existe
        const [existingUser] = await conn.query(usersModel.getByID, [id]);
        if (!existingUser) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }

        // Construir un objeto de actualización con los campos proporcionados
        const updateData = {
            username,
            email,
            password,
            name,
            lastname,
            phone_number,
            role_id,
            id_isactive
        };

        // Filtrar campos que son nulos o indefinidos para evitar sobrescribirlos
        for (const key in updateData) {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        }

        // Verificar si hay campos para actualizar
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ msg: 'No valid fields to update' });
            return;
        }

        // Construir la consulta SQL dinámicamente
        const updateQuery = `UPDATE Users SET ${Object.keys(updateData).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
        const updateParams = [...Object.values(updateData), id];

        // Realizar la actualización
        const result = await conn.query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            res.status(500).json({ msg: 'Failed to update user' });
        } else {
            // Recuperar el usuario actualizado
            const [updatedUser] = await conn.query(usersModel.getByID, [id]);
            res.json({ msg: 'User updated successfully', user: updatedUser });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}
*/
///////////////////////////////////////// actualiza ////////////////////////////////////////////////
/*

// Endpoint para actualizar datos de usuario
const updateUserPatch = async (req = request, res = response) => {
    const { id } = req.params;
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_isactive
    } = req.body;

    if (isNaN(id)) {
        res.status(400).json({ msg: 'ID no válido' });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        // Verificar si el usuario que deseas actualizar existe
        const [existingUser] = await conn.query(usersModel.getByID, [id]);
        if (!existingUser) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }

        // Construir un objeto de actualización con los campos proporcionados
        const updateData = {
            username,
            email,
            password,
            name,
            lastname,
            phone_number,
            role_id,
            id_isactive
        };

        // Filtrar campos que sean nulos o indefinidos para evitar sobrescribirlos
        for (const key in updateData) {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        }

        // Verificar si hay campos para actualizar
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ msg: 'No hay campos válidos para actualizar' });
            return;
        }

        // Construir la consulta de actualización SQL dinámicamente
        const updateQuery = `UPDATE Users SET ${Object.keys(updateData).map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
        const updateParams = [...Object.values(updateData), id];

        // Realizar la actualización
        const result = await conn.query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            res.status(500).json({ msg: 'Error al actualizar el usuario' });
        } else {
            // Recuperar al usuario actualizado
            const [updatedUser] = await conn.query(usersModel.getByID, [id]);
            res.json({ msg: 'Usuario actualizado exitosamente', user: updatedUser });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}
*/
/*
const updateUserByUsuario = async (req = request, res = response) => {
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_isactive
    } = req.body;

    if (!username || !email || !password || !name || !lastname || !phone_number || !role_id || !id_isactive) {
        res.status(400).json({ msg: "Falta información del usuario" });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        // Verificar si el usuario existe antes de actualizar
        const [existingUser] = await conn.query(usersModel.getUserByUsuario, [username]);
        if (!existingUser || existingUser.length === 0) {
            res.status(404).json({ msg: `El usuario ${username} no se encuentra registrado.` });
            return;
        }

        // Construir la consulta de actualización SQL
        const updateQuery = `
            UPDATE users
            SET email = ?,
                password = ?,
                name = ?,
                lastname = ?,
                phone_number = ?,
                role_id = ?,
                id_isactive = ?
            WHERE username = ?
        `;

        const updateParams = [email, password, name, lastname, phone_number, role_id, id_isactive, username];

        const { affectedRows } = await conn.query(updateQuery, updateParams);

        if (affectedRows === 0) {
            res.status(500).json({ msg: `No se pudo actualizar el registro del usuario ${username}` });
            return;
        }

        res.json({ msg: `El usuario ${username} se actualizó satisfactoriamente` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    } finally {
        if (conn) {
            conn.end();
        }
    }
};


const updateUserByUsuario = async (req = request, res = response) => {
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_isactive
    } = req.body;

    if (!username || !email || !password || !name || !lastname || !phone_number || !role_id || !id_isactive) {
        res.status(400).json({ msg: "Falta información del usuario" });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        // Verificar si el usuario existe antes de actualizar
        const [existingUser] = await conn.query(usersModel.getUserByUsuario, [username]);
        if (!existingUser || existingUser.length === 0) {
            res.status(404).json({ msg: `El usuario ${username} no se encuentra registrado.` });
            return;
        }

        // Construir la consulta de actualización SQL
        const updateQuery = `
            UPDATE users
            SET email = ?,
                password = ?,
                name = ?,
                lastname = ?,
                phone_number = ?,
                role_id = ?,
                id_isactive = ?
            WHERE username = ?
        `;

        const updateParams = [email, password, name, lastname, phone_number, role_id, id_isactive, username];


        console.log("updateQuery-prueba:", updateQuery);
        console.log("updateParams-prueba:", updateParams);

        const { affectedRows } = await conn.query(updateQuery, updateParams);

        if (affectedRows === 0) {
            res.status(500).json({ msg: `No se pudo actualizar el registro del usuario ${username}` });
            return;
        }

        res.json({ msg: `El usuario ${username} se actualizó satisfactoriamente` });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error });
    } finally {
        if (conn) {
            conn.end();
        }
    }
};

*/
// Endpoint para actualizar datos de usuario
// Endpoint para modificar un usuario por ID utilizando el método PATCH
/*

const updateUser = async (req = request, res = response)=>{
    //---------------------------- recibe los datos -----------------------------
        const {id} = req.params;// Captura el ID de los parámetros en la URL
       

        const {
            username, 
            email, 
            password, 
            name, 
            lastname,
            phone_number = '',
            role_id,
            id_isactive = 1
        } =req.body; //Extrae los datos
    //----------------------------
       // Comprueba si algunos datos requeridos están ausentes y responde con un mensaje de error si es el caso
        if (!username || !email || !password || !name || !lastname || !role_id){
            res.status(400).json({msg: "Missing information"});
            return;
        }
 
         let conn;
    
         try {
            conn = await pool.getConnection();//Conexion a la bd
    
            // Realiza una consulta para obtener el usuario existente con el ID especificado
            const [existingUser] = await conn.query(
                usersModel.getByID, 
                [id],
                (err)=>{if(err)throw err;});
            // Verifica si el usuario existe en la base de datos y responde con un error 404 si no se encuentra
            if (!existingUser) {
                res.status(404).json({ msg: `User with id ${id} not found` });
                return;
            }
    //----------------
             // Realiza una consulta y comprueba si ya existe un usuario con el mismo nombre de usuario y 
             //responde con un error 409 si es el caso
            const [usernameUser] = await conn.query(
                usersModel.getByUserName,
                [username],
                (err)=>{if(err)throw err;}
            );

            if (usernameUser){
                res.status(409).json({msg: `User with username ${username} already exists`});
                return;
            }

             if (usernameUser){
                res.status(409).json({msg: `User with email852 ${email} already exists`});
                return;
            }
    //---------------
            // Realiza una consulta y comprueba si ya existe un usuario con el mismo email y 
            //responde con un error 409 si es el caso
            const [emailUser] = await conn.query(
                usersModel.getByEmail,
                [email],
                (err)=>{if(err)throw err;}
            );
           
    
    //---------------       
            // Aqui se realiza una consulta de actualización para modificar los datos del usuario
            const updateResult = await conn.query(
                usersModel.updateByID,
                [username, email, password, name, lastname, phone_number, role_id, id_isactive, id]
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
////////////////////////// BORRAR ///////////////////////////////////////
const deleteUser = async(req = request, res= response) =>{
    let conn;
    const{id} = req.params;
 
    
    try{
     conn= await pool.getConnection();
 
     const [userExists] = await conn.query(
         usersModel.getByID,
         [id],
         (err) => {throw err;}
        )
        if(!userExists|| userExists.is_active === 0){
         res.status(404).json({msg : 'user not found'});
         return;
        }
     
     
        const userDelete = await conn.query(
         usersModel.deleteRow,
         [id],
         (err) => {if (err) throw err;}
        )
     
        if (userDelete.affectedRows === 0) {
         throw new Error ({msg: 'Failed to delete user' })
        };
     
 
    }catch(error){
     console.log(error);
     res.status(500).json(error)
    }finally{
     if(conn)conn.end();
    }
 }

module.exports = { listUsers, listUserByID, addUser,deleteUser};


//endpint para modificar un usuario //validar toda la informacion
//validar que ek usuario exista*
//validar que lo cambios los campos que no se repitan
//checar que usuario quiero modificar
//esto con e ID
//que los cambios que se hagan no impiquen nombre de usuario o correo
//que esto se haga con el id
