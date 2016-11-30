module.exports = {
  context: __dirname + '/',
  entry: {
    'bundle': './windmap-ui'
  },
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel", 
        query:{
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ]
  }
};
