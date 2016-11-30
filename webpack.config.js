module.exports = {
  context: __dirname + '/',
  entry: {
    'windmap-ui': './windmap-ui'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel", 
        query:{
          presets: ['es2015']
        }
      }
    ]
  }
};
