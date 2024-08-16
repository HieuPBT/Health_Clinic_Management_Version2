import crypto from 'crypto';

const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex');
}

export default generatePassword;
