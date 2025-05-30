import vueGtag from 'vue-gtag-next';

export default function (app) {
    app.use(vueGtag, {
        property: {
            id: 'G-G7N22P36K2'
        },
        params: {
            debug_mode: true, // ✅ This enables DebugView tracking
        },
        appName: 'Kapybara Slot Machine',
        appVersion: '1.0.0',
        enabled: true,
    });
    console.log("VueGtag plugin loaded");
}
  