const {gitDescribe, gitDescribeSync} = require('git-describe')
process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
process.env.VUE_APP_GIT_TAG = gitDescribeSync().tag
console.log(gitDescribeSync())
// not work
// module.exports = {
//     publicPath: '/portal/'
// };

// module.exports = {
//     publicPath: './',
//     assetsDir: './'
// };