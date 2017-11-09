process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

const { getApp } = require('./build');

if (!module.parent) {
    getApp()
        .then(app => app.listen(process.env.PORT))
        .then(server => (console.log(`server bootstrapped using port ${process.env.PORT}`), void 0))
        .catch(err => console.error(err));
}

module.exports = getApp;