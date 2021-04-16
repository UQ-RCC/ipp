const {gitDescribe, gitDescribeSync} = require('git-describe')
process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
process.env.VUE_APP_GIT_TAG = gitDescribeSync().tag

module.exports = {
    publicPath: './'
};

// module.exports = {
//     publicPath: process.env.BASE_URL,
//     assetsDir: process.env.BASE_URL
// };