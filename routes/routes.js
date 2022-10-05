// import other routes
const dbRoutes = require('./db');

const appRouter = (app, fs) => {

    // default route
    app.get('/', (req, res) => {
        res.send('welcome to the development api-server');
    });
    
    // // other routes
    dbRoutes(app, fs);

};

module.exports = appRouter;