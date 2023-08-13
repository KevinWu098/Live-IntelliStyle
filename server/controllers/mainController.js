// GET Homepage
exports.homepage = async (req, res) => {
    const locals = {
        title: "IntelliStyle",
        description: 'IntelliStyle - Your Personal Stylist',
    }

    res.render('index', {
        locals,
        layout: '../views/layouts/front-page'
    })
}

// GET About
exports.about = async (req, res) => {
    const locals = {
        title: "About - IntelliStyle",
        description: 'IntelliStyle - Your Personal Stylist',
    }

    res.render('about', locals)
}