require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = {
    userId: 16,
    username: "testuser"
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
console.log("새로 생성된 JWT 토큰:", token);
