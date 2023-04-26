

const createUsersTablepg = (execute) => {
    const text = `
        CREATE TABLE IF NOT EXISTS sap_jwt_products_users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );`

    execute(text).then(result => {
        if (result) {
            console.log('Table created postgres',result);
        }
    });
}

module.exports = { createUsersTablepg };

