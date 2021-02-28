
class Common {
    stringToArrayBuffer(value) {
        return Buffer.from(value, 'base64');
    }
    arrayBufferToString(value) {
        return Buffer.from(value).toString('base64');
    }

    async sleep() {
        new Promise(resolve => setTimeout(resolve, 2000));
    }

    getRandom(number) {
        if (!Number.isInteger(number)) return '0';
        return Math.floor(Math.random() * Math.floor(number)).toString()
    }
}

module.exports = Common;