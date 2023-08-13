// GET Homepage
exports.homepage = async (req, res) => {
    const locals = {
        title: "NodeJS Notes",
        description: 'Free NodeJS Notes App',
    }

    res.render('index', {
        locals,
        layout: '../views/layouts/front-page'
    })
}

// GET About
exports.about = async (req, res) => {
    const locals = {
        title: "About - NodeJS Notes",
        description: 'Free NodeJS Notes App',
    }

    res.render('about', locals)
}