module.exports = {
  context: __dirname + '/',
  entry: {
    'bundle': './components/windmap-ui'
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
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css?modules'],
      },
    ]
  }
};
