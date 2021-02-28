const settings = require('./settings.json');

class ConnectionHelper {
    constructor() {
        let { login, password, dbHost, dbPath } = settings;
        this.settingsOptions = {
            login: login,
            password: password,
            dbPath: dbPath,
            dbHost: dbHost
        }
    }

    createConnection() {
        return new Promise((resolve, reject) => {
            sql.connect(`mssql://
                ${this.settingsOptions.login}:${this.settingsOptions.password}@${this.settingsOptions.dbHost}/
                ${this.settingsOptions.password}`, (err, sql) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(sql);
                }
            });
        });
    }

    async getCompanies() {
        let connection = await this.createConnection();
        let response = await connection.request().query(`SELECT TOP 10 [ID] FROM ${this.settingsOptions.dbHost}.[dbo].[COMPANY]`);
        let companies = [];
        for (let i = 0; i < response.recordsets[0].length; i++) {
            if (!companies.some(x => x.ID == response.recordsets[0][i].ID)) {
                companies.push(response.recordsets[0][i].ID);
            }
        }
        await connection.close();
        return companies;
    }

    async getCompaniesClear() {
        let connection = await createConnection();
        response = await connection.request().query(`SELECT * FROM ${this.settingsOptions.dbHost}.[dbo].[COMPANYC]`);
        let companiesClear = [];
        for (let i = 0; i < response.recordsets[0].length; i++) {
            companiesClear.push(response.recordsets[0][i]);
        }
        await connection.close();
        return companiesClear;
    }

    async getClears() {
        let connection = await createConnection();
        response = await connection.request().query(`SELECT TOP 10 [ID] FROM ${this.settingsOptions.dbHost}.[dbo].[CLEAR]`);
        let clears = [];
        for (let i = 0; i < response.recordsets[0].length; i++) {
            if (!clears.some(x => x.ID == response.recordsets[0][i].ID)) {
                clears.push(response.recordsets[0][i].ID);
            }
        }
        await connection.close();
        return clears;
    }

    async getBadgeStatusID() {
        let connection = await createConnection();
        response = await connection.request().query(`SELECT TOP 1 [ID] FROM${this.settingsOptions.dbHost}.[dbo].[STATUS]`);
        let badgeStatusID = response.recordsets[0][0].ID;
        await connection.close();
        return badgeStatusID;
    }

    async getBadgeTypeID() {
        let connection = await createConnection();
        response = await connection.request().query(`SELECT TOP 1 [ID] FROM ${this.settingsOptions.dbHost}.[dbo].[TYP]`);
        let badgeTypeID = response.recordsets[0][0].ID;
        await connection.close();
        return badgeTypeID;
    }

    async getBlobTypeID() {
        let connection = await createConnection();
        response = await connection.request().query(`SELECT TOP 1 ID FROM ${this.settingsOptions.dbHost}.[dbo].[BLOB_TYPES] WHERE DESCRP = N'Фото для карты'`)
        let blobTypeID = response.recordsets[0][0].ID;
        await connection.close();
        return blobTypeID;
    }
}

module.exports = ConnectionHelper;