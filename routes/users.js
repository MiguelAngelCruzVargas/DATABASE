const { Router } = require('express')

const { listUsers, 
    listUserByID, 
    addUser,
    deleteUser,
   
} = require('../controllers/users')

const router = Router();


//http://localhost:3000/api/v1/users/

router.get('/', listUsers); //obtiene la lista de  los usuarios en la  BD
router.get('/:id', listUserByID); // obtiene la lista de  los usuarios en la  BD por ID
//router.post('/', listUsers);
router.put('/', addUser); //Agrega un nuevo usuario
//router.put('/id', updateUser);
//router.patch('/:id', updateUser);//  Actualiza un usuario por su ID
router.delete('/:id', deleteUser);
module.exports = router;