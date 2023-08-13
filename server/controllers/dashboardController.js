const Clothing = require('../models/Clothing');
const mongoose = require('mongoose');

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
