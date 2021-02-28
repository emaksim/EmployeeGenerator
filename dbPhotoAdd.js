'use strict';
const fs = require('fs');
const sql = require("mssql");
const faker = require('faker');
const moment = require('moment');
const request = require('request-promise');

const types = require('./types.js');
const Common = require('./common.js');
const helper = require('./connectionHelper.js');
const photoGenerator = require('./photoGenerator.js');
const dbPhotoAddTest = require('./dbPhotoAddTest');

const configuration = [];
const regionalSetID = 'ABI1OTlDREFDRS0zOTBFLTRB' // региональные настройки по-умолчанию

class Generator {
    async do() {
        // this.test = new dbPhotoAddTest();
        // await this.test.doTest();
        this.worker = new helper.ConnectionHelper();
        this.common = new Common();
        await this.generateEmployees();
    }

    async loadingRequiredData() {
        configuration.companies = await this.worker.getCompanies();
        configuration.companiesClear = await this.worker.getCompaniesClear();
        configuration.clears = await this.worker.getClears();
        configuration.badgeStatusID = await this.worker.getBadgeStatusID();
        configuration.badgeTypeID = await this.worker.getBadgeTypeID();
        configuration.blobTypeID = await this.worker.getBlobTypeID();
    }

    async generateEmployees() {
        await this.loadingRequiredData();

        for (let i = 0; i < 1500; i++) {
            let photo = photoGenerator.GetPhoto();
            let companyIndex = Math.floor(Math.random() * Math.floor(configuration.companies.length));
            if (companyIndex == 0) companyIndex = companyIndex + 1;
            let organisationUID = configuration.companies[companyIndex - 1];

            let clearCodes = configuration.companiesClear.filter(x => this.common.arrayBufferToString(x.ID) === this.common.arrayBufferToString(organisationUID));

            let passDateStart = moment(faker.date.past()).format('YYYYMMDD HH:mm:ss.SSS');
            let passDateEnd = moment(faker.date.future()).format('YYYYMMDD HH:mm:ss.SSS');
            let startDate = moment(faker.date.past()).format('YYYYMMDD HH:mm:ss.SSS');

            let departmentName = Object.values(types.DepartmentTypes)[companyIndex - 1];
            let positionName = Object.values(types.PositionTypes)[companyIndex - 1] ? positions[companyIndex - 1] : 'позиция';
            let badgeFloor = companyIndex;

            /**
            *  Hardcode unimportant values
            */
            let state = 'ok'; //Состояние. Не более 2 символов
            let zip = '123123' //Индекс
            let supervisor = 'supervi';
            let badgeBuilding = 'Build';
            let phoneNumber = '123456123';
            let extention = 'exten';
            let emercontact = 'emercon';
            let emeraddress1 = 'addr1';
            let emeraddress2 = '.addr2';
            let emmerphone = '112';
            let hairColor = 'hair';
            let eyeColor = 'eye';
            let ssn = 'ssn'; //Социальная безопасность
            /***/

            var res = new Set();
            let list = function getRandomSet(min, max, n) {
                while (res.size < n) res.add(Math.floor(Math.random() * (max - min + 1)) + min);
                return res;
            }
            let passTasknumber = list(1000, 9999, 2000).values();

            let connection = await this.worker.createConnection();
            try {
                console.log(`Добавление нового сотрудника в БД`);
                await connection.request()
                    .input("organisationUID", sql.VarBinary(sql.MAX), organisationUID)
                    .input("badgeStatus", sql.VarBinary(sql.MAX), badgeStatus)
                    .input("badgeType", sql.VarBinary(sql.MAX), badgeType)
                    .query(`declare @UID varbinary(18) exec ${this.settingsOptions.dbHost}.[dbo].[genmicid] 2, @UID out ` +
                        `INSERT INTO${this.settingsOptions.dbHost}.[dbo].[BADGE]([ID], [LNAME], [FNAME], [MI], [STATUS], [TYPE], [ISSUE_DATE], [EXPIRE_DATE])` +
                        `Values( @UID, N'${faker.lastName}', N'${faker.firstName}', '', (@badgeStatus), (@badgeType), '${passDateStart}', '${passDateEnd}')` +
                        `INSERT INTO ${this.settingsOptions.dbHost}.[dbo].[V]([ID], [STARTDATE], [EMPLOYER], [DISPPHOTO], [BADGENUMBER], [ADDRESS1], [ADDRESS2], [CITY], [STATE], [ZIP], [COUNTRY], 
                        [SUPERVISOR], [DEPARTMENT], [TITLE], [BUILDING], [FLOOR], [HOMEPHONE], [OFFICEPHONE], [EXTENSION], [EMERCONTACT], [EMERADDRESS1], [EMERADDRESS2], [EMERPHONE], 
                        [AGE], [DISPSIGNATURE], [HAIRCOLOR], [EYECOLOR], [HEIGHT], [WEIGHT], [SSN], [BIRTHDATE], [DISPHAND])
                        VALUES(@UID, '${startDate}', @organisationUID, @UID, '${companyIndex}', '${faker.address.secondaryAddress()}', '${faker.address.secondaryAddress()}', '${faker.address.city()}', '${state}', '${zip}', '${faker.address.country()}', N'${supervisor}', N'${departmentName}', N'${positionName}',
                        N'${badgeBuilding}', '${badgeFloor}', '${phoneNumber}', '${phoneNumber}', N'${extention}', N'${emercontact}', N'${emeraddress1}', N'${emeraddress2}', N'${emmerphone}', N'${this.common.getRandom(100)}', @UID, N'${hairColor}', N'${eyeColor}',
                        N'${this.common.getRandom(200)}', N'${this.common.getRandom(100)}', N'${ssn}', CURRENT_TIMESTAMP, @UID)`);
                await connection.close();

                connection = await this.worker.createConnection();
                let response = await connection.request().query(`SELECT[ID] FROM${this.settingsOptions.dbHost}.[dbo].[BADGE] Where LNAME = N'${faker.lastName}' AND FNAME = N'${faker.firstName}'`);
                let employeeID = response.recordsets[0][0].ID;
                await connection.close();
                if (photo) {
                    console.log(`Добавление ID фото в БД`);
                    connection = await this.worker.createConnection();

                    await connection.request()
                        .input("employeeID", sql.VarBinary(sql.MAX), employeeID)
                        .input("blobTypeID", sql.VarBinary(sql.MAX), configuration.blobTypeID)
                        .input("data", sql.VarBinary(sql.MAX), photo)
                        .query(`INSERT INTO${this.settingsOptions.dbHost}.[dbo].[BLOBS]([ID], [BLOB_TYPE], [BLOB])` +
                            `VALUES(@employeeID, @blobTypeID, @data)`)
                    await connection.close();
                }

                for (let index = 0; index < 2; index++) {
                    let number = 0;
                    if (passTasknumber.size != 0) {
                        number = passTasknumber.next().value;
                    }
                    console.log(`Добавление пропусков сотрудника в БД`);

                    connection = await this.worker.createConnection();
                    await connection.request()
                        .input("employeeID", sql.VarBinary(sql.MAX), employeeID)
                        .input("companyID", sql.VarBinary(sql.MAX), organisationUID)
                        .input("REGIONAL_WKS_ID", sql.VarBinary(sql.MAX), this.common.stringToArrayBuffer(regionalSetID))
                        .query(`INSERT INTO ${this.settingsOptions.dbHost}.[dbo].[BA_C]([ID], [CARDNO], [STAT_COD], [COMPANY_ID], [EXEC_P], [OVERRIDE], [DOWNLOAD_N],
                        [DOWNLOAD_S], [EVENT_LEV], [ISSUE_LEV], [THREAT_LEV], [INXIT], [PINCODE], [ISSUE_DATE], [EXPIRE_DATE], [LAST_DOOR], [LAST_ACC], [PAR_TEXT], [TRACE], [TYP],
                        [ADDTYPE], [DISARM_RDR], [ARM_RDR], [AUTO_DISABLE_DAYS], [ADA], [USER_LEVEL], [PRIVILEGED], [PIN_EXEMPT], [FLAG1030], [GUARD], [ESCORT], [VISITOR],
                        [USE_COUNT], [USE_ATTEMPTS_COUNT], [NEVER_EXPIRE], [TSTAMP], [GROUPACCESS_DOWNLOAD_FLAG], [GROUPACCESS_ID], [MATRIX_ARM], [MATRIX_GUARD], [PW_MODIFIED],
                        [GALAXY_ARM], [GALAXY_DISARM], [VALID_CHANNELS], [REGIONAL_WKS_ID], [CARDNO_EXT])
                        Values((@employeeID), N'${number}', 'A', (@companyID), 'N', 'N', 'Y', 'N', 0, 0, 0, null, null, N'${passDateStart}', N'${passDateEnd}', null, null,
                        null, 'N', null, 'N', null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Y', null, 'N', null, 0, 0, 0, 0, 0, 16, @REGIONAL_WKS_ID, null)`);
                    await connection.close();

                    clearCodes.forEach(async (clr) => {
                        connection = await this.worker.createConnection();
                        await connection.request()
                            .input("employeeID", sql.VarBinary(sql.MAX), employeeID)
                            .input("clearCode", sql.VarBinary(sql.MAX), clr.CLEAR_ID)
                            .query(`INSERT INTO${this.settingsOptions.dbHost}.[dbo].[BA_CC]([ID], [CARDNO], [CLEAR_COD], [TSTAMP], [CUSTOM_CLEARANCE])
                                    VALUES((@employeeID), N'${number}', (@clearCode), null, 0)`);
                        await connection.close();
                    });
                }

            } catch (err) {
                console.error(err.message);
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        }
    }
}

const generator = new Generator();
generator.do();