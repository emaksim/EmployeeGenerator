const Common = require('./common.js');
const helper = require('./connectionHelper.js');

class GetAddPhotoTest {
    constructor() {
        this.common = new Common();
        this.worker = new helper.ConnectionHelper();
    }
    async doTest() {
        const id = 'kyrEk53Q/0eajBM651i4KQ=='; // сотрудник Т. из БД
        await this.Adder(id);
        await this.Getter(id);
    }

    /**
    *  Пробное добавление фото сотрудника 
    *  employeID - ID сотрудника в строковом виде (buf to string)
    */
    async Adder(employeID) {
        let fileName = 'photo.jpg' //Название фото 
        let blobTypeID = 'AGIKAR79iflN2oY7pk9XRB3p'; //ID типа категории файла из БД

        let connection = await this.worker.createConnection();
        try {
            await connection.request()
                .input("employeID", sql.VarBinary(sql.MAX), this.common.stringToArrayBuffer(employeID))
                .input("blobTypeID", sql.VarBinary(sql.MAX), this.common.stringToArrayBuffer(blobTypeID))
                .query(`INSERT INTO ${this.settingsOptions.dbHost}.[dbo].[BLOBS]  ([ID], [BLOB_TYPE], [BLOB] )
                        SELECT @employeID, @blobTypeID, BulkColumn FROM OpenRowSet (BULK N'C:\\Users\\admin\\Desktop\\${fileName}',
                        SINGLE_BLOB) AS Файл`);
        }
        catch (err) {
            console.error(err.message);
        }
    }

    /**
    *  Проверка добавления фото сотрудника по GUID
    *  id - ID сотрудника в строковом виде (buf to string)
    */
    async Getter(id) {
        let connection = await createConnection();
        try {
            let response = await connection.request()
                .input("employeID", sql.VarBinary(sql.MAX), this.common.stringToArrayBuffer(id))
                .query(`SELECT TOP 1 [BLOB] FROM ${this.settingsOptions.dbHost}.[dbo].[BLOBS]`);
            let data = response.recordsets[0][0].BLOB;
            let imageName = './text.jpg';

            fs.createWriteStream(imageName).write(data);
        }
        catch (err) {
            console.error(err.message);
        }
    }
}

module.exports = GetAddPhotoTest;