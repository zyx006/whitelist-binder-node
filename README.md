# 白名单绑定系统(Node)
## Whitelist Binder(Node)

基于Rcon的Minecraft服务器白名单绑定系统，使用Node实现

开发环境参考：Node-16.20.2 Npm-8.19.4 Python-3.8.2

### 安装步骤
1、在package.json同级目录下运行指令
```node
npm install
```
2、在.env文件中配置参数，包含启动端口，Rcon连接主机、端口、密码

3、运行server.js文件（会自动调用initDatabase.js文件创建sqlite数据库）
```node
node .\server.js
```