
const dbRoutes = (app, fs) => {

    // variables
    const dataPath = './data/db.json';

    // helper methods
    const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };

    const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                throw err;
            }

            callback();
        });
    };

    // READ
    app.get('/db', (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            res.send(JSON.parse(data));
        });
    });

    // CREATE
    app.post('/db', (req, res) => {

        readFile(data => {
            // Note: this isn't ideal for production use. 
            // ideally, use something like a UUID or other GUID for a unique ID value
            const newDbId = Date.now().toString();

            // add the new data
            data[newDbId.toString()] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('new data added');
            });
        },
            true);
    });


    // UPDATE
    app.put('/db/:id', (req, res) => {

        readFile(data => {

            // add the new data
            const dbId = req.params["id"];
            data[dbId] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`DB id:${dbId} updated`);
            });
        },
            true);
    });


    // DELETE
    app.delete('/db/:id', (req, res) => {

        readFile(data => {

            // delete the data
            const dbId = req.params["id"];
            delete data[dbId];

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`DB id:${dbId} removed`);
            });
        },
            true);
    });
};

module.exports = dbRoutes;
