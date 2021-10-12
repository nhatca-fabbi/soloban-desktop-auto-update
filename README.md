
# Run your Desktop app
Set `SOLOBAN_CLIENT_URL` in `./src/constants/config.ts`
(default: https://dev.soloban.com on GCP)
```shell
# local server
$ yarn dev or npm run dev
```

# Build a Desktop app
```shell
# local server
$ WIN_CSC_KEY_PASSWORD=[cert password] GH_TOKEN=[Github Token] yarn build
```
Note: To get Github Token to see [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

# Deploy and release Desktop app
1. update a `version` in `package.json`
2. create a draft in [GitHub Release](https://github.com/apolloinc-dev/soloban/releases)
3. deploy
```shell
$ WIN_CSC_KEY_PASSWORD=[cert password] GH_TOKEN=[Github Token] yarn deploy
```
4. Release
- Click the `Publish release` button in [GitHub Release](https://github.com/apolloinc-dev/soloban/releases)