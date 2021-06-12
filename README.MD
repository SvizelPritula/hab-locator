# High-altitude Balloon Locator

HAB Locator is a small React app that connects to the [habitat](http://habitat.habhub.org/) database maintained by [UKHAS](https://ukhas.org.uk/). It uses the GPS and compass of your device to show you the direction and distance to any balloon tracked in the database.

## Usage

The app is presently hosted at <https://hab-locator.appspot.com/>.

For the best user experience, use a **Chromium** browser like **Chrome** and **Opera**. **Brave** browser also works great, but you have to enable *Motion sensors* in *Site settings*. As far as I know, this setting cannot be changed on a site to site basis.

On **Safari**, compass access requires a button press. Such a button is provided for your convenience. It should be noted that Safari is the least tested of all mentioned browsers, since I'm not in possession of a device that Safari supports.

Lastly, **Firefox** provides no way for sites to access the device compass at all. If you want to use the app in Firefox, you will need a physical compass to calibrate north on each page load using the *Calibrate North* button.

## Local installation

This app is created using [Create React App](https://create-react-app.dev/). First, clone this repo, install [Node.js](https://nodejs.org/en/) and run the following command to install dependencies:

```
npm i
```

Then, use this command to build:

```
npm run build
```

Or this command to start a development server:

```
npm start
```

## License
The source for this app is licensed under the [MIT](https://choosealicense.com/licenses/mit/) license. (This license is also sometimes called Expat.) All dependencies happen to use the exact same license.