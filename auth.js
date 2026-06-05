function createBasicAuth(username, password) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required');
        }

        const encoded = authHeader.split(' ')[1];
        const decoded = Buffer.from(encoded, 'base64').toString();
        const [user, pass] = decoded.split(':');

        if (user === username && pass === password) {
            return next();
        }

        return res.status(401).send('Unauthorized');
    };
}

module.exports = {
    listenerAuth: createBasicAuth(
        process.env.LISTENER_USERNAME,
        process.env.LISTENER_PASSWORD
    ),

    viewerAuth: createBasicAuth(
        process.env.VIEWER_USERNAME,
        process.env.VIEWER_PASSWORD
    )
};

//const auth = require('basic-auth');
//
//const admins = {
//  'username': { password: 'password' },
//};
//
//module.exports = function (request, response, next) {
//  const user = auth(request);
//  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
//    response.set('WWW-Authenticate', 'Basic realm="example"');
//    return response.status(401).send();
//  }
//  return next();
//};
