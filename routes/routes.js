const express = require('express');
const { validationResult, check, body, param } = require('express-validator');
const { default: mongoose } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const router = express.Router()

module.exports = router;

const User = require('../models/User');
const Movies = require('./movies');

router.get('/movies',(req,res)=>{
    try{
        res.json(Movies)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
//Add user Method
router.post('/add-user', 
    check('firstName').notEmpty().withMessage('First Name should not be empty'),
    check('lastName').notEmpty().withMessage('Last Name should not be empty'),
    check('email').notEmpty().withMessage('Email should not be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    body('email').custom(async (value) => {
        const user = await User.find({email:value});
        if (user.length) {
            return Promise.reject('E-mail already in use');
        }
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const data = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            contactNumber: req.body.contactNumber,

        })

        try {
            const dataToSave = await data.save();
            res.status(200).json(dataToSave)
        }
        catch (error) {
            res.status(400).json({message: error.message})
        }
    }
)

//Get all users Method
router.get('/all-users', async (req, res) => {
    try{
        const users = await User.find();
        res.json(users)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
    
})

//Get user by ID Method
router.get('/user/:id', async(req, res) => {
    try{
        const data = await User.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Update user by ID Method
router.patch('/update/user/:id', 
    check('firstName').notEmpty().withMessage('First Name should not be empty'),
    check('lastName').notEmpty().withMessage('Last Name should not be empty'),
    check('email').notEmpty().withMessage('Email should not be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    body('email').custom(async (value, { req }) => {
        const user = await User.find({email:value, _id:{$ne: ObjectId(req.params.id)}});
        if (user.length > 0) {
            return Promise.reject('E-mail already in use');
        }
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        try {
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };
            const result = await User.findByIdAndUpdate(
                id, updatedData, options
            )
            res.send(result)
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
)

//Delete user by ID Method
router.delete('/delete/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findByIdAndDelete(id)
        res.json({message:`Document with ${data.firstName} ${data.lastName} has been deleted..`})
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
