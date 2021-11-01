var winston = require('winston');

var label = function (mod) {
    var labels  = mod.filename.split('/');
    return labels[labels.length - 2] + '/' + labels.pop();
};

module.exports = function (mod) {
    return new winston.createLogger({
        transports: [
            new winston.transports.Console({
                label: label(mod),
                json: true,
                timestamp: true,
                depth: true,
                colorize: true,
            }),
        ],
        exitOnError: false,
    })
}