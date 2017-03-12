var webpack = require('webpack');

module.exports = {
  entry: {
    'bundle': './components/windmap-ui-lfm'
  },
  output: {
    path: __dirname,
    filename: 'bundle-lfm.js'
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
  },
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	],
};
