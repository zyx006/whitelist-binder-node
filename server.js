// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const Rcon = require('rcon-client').Rcon;
const Joi = require('joi');
const config = require('./config'); // 引入rcon配置文件

// 引入 initDatabase.js
require('./initDatabase'); // 运行数据库初始化

const app = express();
const db = new sqlite3.Database('whitelist.db');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由设置
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 数据验证模式
const schema = Joi.object({
    studentId: Joi.string()
        .length(10)                    // 学号必须为10位
        .pattern(/^[0-9]+$/)           // 学号只能为数字
        .required().messages({
            'string.empty': '学号为必填项',
            'string.length': '学号必须为10位数字',
            'string.pattern.base': '学号只能为数字'
        }),
    name: Joi.string()
        .required().messages({
            'string.empty': '姓名为必填项'
        }),
    username: Joi.string()
        .min(3).max(16)                // 用户名长度需在 3 到 16 个字符之间
        .pattern(/^(?!\d+$)[a-zA-Z0-9_]+$/) // 用户名不能为纯数字且只能包含字母、数字和下划线
        .required().messages({
            'string.empty': '用户名为必填项',
            'string.min': '用户名长度需在3到16个字符之间',
            'string.max': '用户名长度需在3到16个字符之间',
            'string.pattern.base': '用户名只能包含字母、数字和下划线，且不能为纯数字'
        })
});

app.post('/api/bind', (req, res) => {
    const { error } = schema.validate(req.body);

    if (error) {
        console.error('验证错误:', error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }

    const { studentId, name, username } = req.body;

    // 查询是否重复
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('数据库查询错误:', err);
            return res.status(500).json({ message: '数据库查询错误，请稍后再试。' });
        }

        if (row) {
            console.error(`学号:${studentId}，姓名:${name} 尝试添加用户名'${username}'失败，用户名已存在`);
            return res.status(400).json({ message: '用户名已存在，请选择其他用户名。' });
        }

        // 插入新记录
        db.run('INSERT INTO users (student_id, name, username) VALUES (?, ?, ?)', [studentId, name, username], function(err) {
            if (err) {
                console.error('插入数据库错误:', err);
                return res.status(500).json({ message: '插入数据库错误，请稍后再试。' });
            }

            // 远程连接到 Minecraft 服务器并添加白名单
            const rcon = new Rcon({
                host: config.rcon.host,
                port: config.rcon.port,
                password: config.rcon.password
            });

            rcon.connect().then(() => {
                return rcon.send(`whitelist add ${username}`);
            }).then((response) => {
                console.log('添加白名单成功:', response);
                rcon.end();
                res.json({ message: '成功绑定用户名并添加白名单！' });
            }).catch((err) => {
                console.error('RCON 错误:', err);
                res.status(500).json({ message: '添加白名单时出错，请稍后再试。' });
            });
        });
    });
});

app.listen(config.port, () => {
    console.log(`服务器在 http://localhost:${config.port} 上运行`);
});
