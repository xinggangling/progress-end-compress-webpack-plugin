# progress-end-compress-webpack-plugin

## Installation

```
npm i -D progress-end-compress-webpack-plugin
```

## Usage

```
const ProgressEndCompressPlugin = require('progress-end-compress-webpack-plugin');
new ProgressEndCompressPlugin({
  compressDir: {
    paths: [{
      sourceDir: path.resolve(__dirname, 'dist'),
      targetDir: path.resolve(__dirname),
      name: 'dist',
      hash: [hash]
    }]
  },
  sshConfig: {
    host: '192.168.3.116',
    username: 'root',
    port: 22,
    password: '123456',
    romotePath: '/home/reedsec/web/web-api-c2b/web-view/',
    replaceDirectly: false, // whether replace build folder
    rename: 'dist-new' // whether rename build folder name
  }
})

script: {
  build: 'webpack webpack.config.js --useSsh'
}
```

## Image Example

#### building
>![图片](https://github.com/xinggangling/progress-end-compress-webpack-plugin/blob/master/building.png)

#### builded
>![图片](https://github.com/xinggangling/progress-end-compress-webpack-plugin/blob/master/builded.png)

#### server side
>![图片](https://github.com/xinggangling/progress-end-compress-webpack-plugin/blob/master/server_side.png)
>
>if set replaceDirectly = true; build folder will be replace directly.
