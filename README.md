# Reproduction steps

```
git clone -b test https://github.com/zzyg675/cubingbot.git && cd cubingbot
# Compile the code, although the current code was already compiled.
npx tsc
# Run it. This should result in the "[ERR_PACKAGE_PATH_NOT_EXPORTED]" error.
node dist/index
```
