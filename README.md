This is a Aupi Project!

## Getting Started

Use the following branch:
```bash
git pull 
git checkout dev
```

First, install the dependencies:

```bash
yarn install
```

Then, run the following command

```bash
cp .env.example .env
```

Then, run the development server:

```bash
yarn start
# or
yarn expo start
```

To make migrations with drizzle

```bash
yarn drizzle-kit generate
```

#### Error with Android Path

```bash
Logs for your project will appear below. Press Ctrl+C to exit.
› Opening on Android...
Failed to resolve the Android SDK path. Default install location not found: /home/felipe/Android/sdk. Use ANDROID_HOME to set the Android SDK location.
```

To resolve this possibly error:

The React Native tools require some environment variables to be set up in order to build apps with native code.

Add the following lines to your `$HOME/.bash_profile` or $HOME/.bashrc (if you are using zsh then ~/.zprofile or ~/.zshrc) config file:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
`.bash_profile` is specific to bash. If you're using another shell, you will need to edit the appropriate shell-specific config file.

Type `source $HOME/.bashrc` for bash or `source $HOME/.zshrc` to load the config into your current shell. Verify that ANDROID_HOME has been set by running echo $ANDROID_HOME and the appropriate directories have been added to your path by running echo $PATH.
