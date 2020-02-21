const testWorker = /\.worker\.js$/
module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    config.module.rule('js').exclude.add(testWorker)
    config.module
      .rule('worker')
      .test(testWorker)
      .use('worker-loader')
      .loader('worker-loader')
  }
}
