# Replay Scouter App

This repository holds the code for the Showdown Replay Scouter UI.

It is in practice a nice UI wrapper for the [Showdown Replay Scouter API](https://github.com/FullLifeGames/Showdown-Replay-Scouter).

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Runs the minified production build
```
yarn preview
```

### Lints files
```
yarn lint
```

### Lints and fixes files (do this before every commit)
```
yarn lint:fix
```

### Generate API dependencies
```
Invoke-WebRequest -OutFile openapi-generator-cli.jar https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/6.3.0/openapi-generator-cli-6.3.0.jar
java -jar .\openapi-generator-cli.jar generate -i "https://replayscouter.api.fulllifegames.com/swagger/v1/swagger.json" -g typescript-fetch -o src/api/
```
