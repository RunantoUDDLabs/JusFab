print('init.js is running...', MONGO_INITDB_DATABASE);

db = db.getSiblingDB(MONGO_INITDB_DATABASE);

if (!db.getUser(MONGO_INITDB_USERNAME)) {
    db.createUser({
        user: MONGO_INITDB_USERNAME,
        pwd: MONGO_INITDB_PASSWORD,
        roles: [{ role: "readWrite", db: MONGO_INITDB_DATABASE }]
    });

    db.createCollection("test-collection");
    print(`User ${MONGO_INITDB_USERNAME} created and test-collection added.`);
} else {
    print(`User ${MONGO_INITDB_USERNAME} already exists.`);
}
