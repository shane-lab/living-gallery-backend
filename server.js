process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

const { getApp } = require('./build');

if (!module.parent) {
    const chalk = require('chalk');

    getApp()
        .then(app => app.listen(process.env.PORT, 
            console.log(chalk`server bootstrapped, using {blue ${process.env.NODE_ENV}} environment on port {blue ${process.env.PORT}}`)))
        .catch(err => console.error(err));
}

module.exports = getApp;