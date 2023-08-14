const Clothing = require('../models/Clothing');
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the destination folder for uploaded files

// GET Dashboard
exports.dashboard = async (req, res) => {
    // async function insertDummyCategoryData() {
    //     try {
    //         await Clothing.insertMany([
    //             {
    //                 user: "64d82f73c064d9f0be3e63f0",
    //                 clothingType: "t-shirt",
    //                 description: "A plain gray t-shirt",
    //                 createdAt: "1671634422539",
    //             },
    //             {
    //                 user: "64d82f73c064d9f0be3e63f0",
    //                 clothingType: "jacket",
    //                 description: "red jacket",
    //                 createdAt: "1671634422539",
    //             },
    //             {
    //                 user: "64d82f73c064d9f0be3e63f0",
    //                 clothingType: "jeans",
    //                 description: "dark blue skinny jeans",
    //                 createdAt: "1671634422539",
    //             },
    //             {
    //                 user: "64d82f73c064d9f0be3e63f0",
    //                 clothingType: "baseball cap",
    //                 description: "a baseball cap",
    //                 createdAt: "1671634422539",
    //             },
    //         ]);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // insertDummyCategoryData()

    let perPage = 12;
    let page = req.query.page || 1;

    const locals = {
        title: 'Dashboard - IntelliStyle',
        description: 'IntelliStyle - Your Personal Stylist',
    };

    try {
        // Mongoose "^7.0.0 Update
        const clothes = await Clothing.aggregate([
            { $sort: { updatedAt: -1 } },
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $project: {
                    clothingType: { $substr: ['$clothingType', 0, 30] },
                    description: { $substr: ['$description', 0, 100] },
                },
            },
        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        // const count = await clothes.count()
        const count = await Clothing.countDocuments({
            user: new mongoose.Types.ObjectId(req.user.id),
        });

        // console.log(clothes)

        res.render('dashboard/index', {
            userName: req.user.firstName,
            locals,
            clothes,
            layout: '../views/layouts/dashboard',
            current: page,
            pages: Math.ceil(count / perPage),
        });
    } catch (error) {
        console.log(error);
    }
};

// GET Specific Clothing
exports.dashboardViewClothing = async (req, res) => {
    const clothing = await Clothing.findById({ _id: req.params.id })
        .where({ user: req.user.id })
        .lean();

    if (clothing) {
        res.render('dashboard/view-clothes', {
            clothingID: req.params.id,
            clothing,
            layout: '../views/layouts/dashboard',
        });
    } else {
        res.send('Something went wrong...');
    }
};

// PUT Update Specific Clothing
exports.dashboardUpdateClothing = async (req, res) => {
    try {
        await Clothing.findOneAndUpdate(
            { _id: req.params.id },
            {
                clothingType: req.body.title,
                description: req.body.body,
                updatedAt: Date.now(),
            }
        ).where({ user: req.user.id });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

// DELETE Specific Clothing
exports.dashboardDeleteClothing = async (req, res) => {
    try {
        await Clothing.deleteOne({ _id: req.params.id }).where({
            user: req.user.id,
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

// GET Add Clothing
exports.dashboardAddClothing = async (req, res) => {
    res.render('dashboard/add', {
        layout: '../views/layouts/dashboard',
    });
};

// POST Add Clothing
exports.dashboardAddClothingSubmit = async (req, res) => {
    try {
        const { title, body } = req.body;

        const clothingData = {
            clothingType: title,
            description: body,
            user: req.user.id,
        };

        await Clothing.create(clothingData);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

// GET AI Add Clothing
exports.dashboardAiAddClothing = async (req, res) => {
    res.render('dashboard/ai-add', {
        layout: '../views/layouts/dashboard',
    });
};

async function queryResNet(filename) {
    const data = fs.readFileSync(filename);
    const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/resnet-50',
        {
            headers: {
                Authorization: process.env.HF_AUTH,
            },
            method: 'POST',
            body: data,
        }
    );
    const result = await response.json();
    return result;
}

// POST Add Clothing
exports.dashboardAiAddClothingSubmit = async (req, res) => {
    try {
        // Access the uploaded file
        const uploadedFile = req.file;

        // Process the uploaded file
        const aiResult = await queryResNet(uploadedFile.path);

        const clothingData = {
            clothingType: aiResult[0].label,
            description: `AI Added; Confidence: ${aiResult[0].score}`,
            user: req.user.id,
        };

        await Clothing.create(clothingData);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};
